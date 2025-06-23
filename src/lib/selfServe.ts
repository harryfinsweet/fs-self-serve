import { selectors, attributes } from "@lib/attributes";
import {
  cart,
  bulkOverwriteServicesToCart,
  addLineItem,
  resetCart,
} from "@/stores/cart";
import type { Service, Package } from "@/stores/cart";
import { effect } from "@vue/reactivity";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);
export class SelfServe {
  currentStep: number;
  allServices: Service[];
  allPackages: Package[];
  navLinks: NodeListOf<HTMLElement>;
  previousTotal: number;

  constructor() {
    const allForms = document.querySelectorAll(selectors.formStep);

    this.currentStep = cart.value.currentStep;
    this.allServices = [];
    this.allPackages = [];
    this.previousTotal = 0;
    this.navLinks = document.querySelectorAll(
      selectors.sidebarLink
    ) as NodeListOf<HTMLElement>;
    allForms.forEach((form) => {
      // Listen for submissions
      form.addEventListener("submit", (event: Event) => {
        // "Disables" webflow form handling
        event.preventDefault();
        event.stopPropagation();
        const formData = new FormData(form as HTMLFormElement);
        this.validateAndProcessForm(form as HTMLFormElement, formData);
      });
    });

    this.loadCart();
    this.loadAllServices();
    this.displayCurrentForm();
    this.renderSidebar();
    this.renderServicePackages();
    this.addEventListners();
    this.renderContractDetails();
  }

  private loadCart() {
    if (cart.value.currentStep === 5) {
      resetCart();
      return;
    }

    const selectedServices = cart.value.selectedServices;
    const selectedPackages = cart.value.lineItems.map(
      (item) => item.servicePackage
    );

    const servicesCards = document.querySelectorAll(selectors.service);
    servicesCards.forEach((card) => {
      const input = card.querySelector("input") as HTMLInputElement;
      const serviceSlug = input.getAttribute("name");
      if (serviceSlug) {
        const service = selectedServices.find(
          (service) => service.slug === serviceSlug
        );
        if (service) {
          input.checked = true;
        }
      }
    });

    const packagesCards = document.querySelectorAll(selectors.servicePackage);
    packagesCards.forEach((card) => {
      const packageName = card.getAttribute(attributes.servicePackageSlug);
      if (packageName) {
        const input = card.querySelector("input") as HTMLInputElement;
        const packageFound = selectedPackages.find(
          (pkg) => pkg.slug === packageName
        );
        if (packageFound) {
          input.checked = true;
        }
      }
    });
  }

  private validateAndProcessForm(form: HTMLFormElement, formData: FormData) {
    const stepNumber = form.getAttribute(attributes.formStepNumber);
    if (stepNumber) {
      this.currentStep = parseInt(stepNumber);
    } else {
      console.error("Step number not found");
      return;
    }
    switch (this.currentStep) {
      case 1:
        this.validateStep1();
        break;
      case 2:
        this.validateStep2(form, formData);
        break;
      case 3:
        this.validateStep3(form);
        break;
      case 4:
        this.validateStep4();
        break;
    }
  }

  private validateStep1() {
    cart.value.currentStep++;
  }

  private validateStep2(form: HTMLFormElement, formData: FormData) {
    const data = Object.fromEntries(formData) as {
      [key: string]: string;
    };
    let services: Service[] = [];
    Object.keys(data).forEach((key) => {
      const service = this.allServices.find((service) => service.slug === key);
      if (service) {
        services.push(service);
      }
    });
    const serviceError = form.querySelector(
      selectors.formError
    ) as HTMLDivElement;
    if (services.length === 0) {
      serviceError.textContent = "Please select at least one service";
      serviceError.style.display = "block";
    } else {
      serviceError.style.display = "none";
      bulkOverwriteServicesToCart(services);
      cart.value.currentService = services[0];
      cart.value.currentServiceIndex = 0;
      cart.value.currentStep++;
    }
  }

  private validateStep3(form: HTMLFormElement) {
    const currentServiceValue = cart.value.currentService;
    const formError = form.querySelector(selectors.formError) as HTMLDivElement;
    formError.style.display = "none";
    if (currentServiceValue) {
      const selectedPackage = cart.value?.lineItems.find(
        (item) => item.service.slug === currentServiceValue.slug
      );
      if (selectedPackage) {
        cart.value.currentStep++;
      } else {
        formError.textContent = `Please select a package for ${currentServiceValue.name}`;
        formError.style.display = "block";
      }
    }
  }

  private validateStep4() {
    cart.value.currentStep++;
  }

  private loadAllServices() {
    const allServicesCards = document.querySelectorAll(selectors.service);
    allServicesCards.forEach((card) => {
      const serviceTitle = card.querySelector(selectors.serviceTitle);
      const serviceDescription = card.querySelector(
        selectors.serviceDescription
      );
      const serviceWhatsIncluded = card.querySelector(
        selectors.serviceWhatsIncluded
      );
      const serviceWhatsExcluded = card.querySelector(
        selectors.serviceWhatsExcluded
      );
      const serviceSlug = card.querySelector("input")?.getAttribute("name");
      this.allServices.push({
        name: serviceTitle?.textContent || "",
        description: serviceDescription?.textContent || "",
        whatsIncluded: serviceWhatsIncluded?.textContent || "",
        whatsExcluded: serviceWhatsExcluded?.textContent || "",
        slug: serviceSlug || "",
        packages: [],
      });
    });

    const allPackages = document.querySelectorAll(
      selectors.servicePackage
    ) as NodeListOf<HTMLElement>;
    allPackages.forEach((pkg: HTMLElement) => {
      const packageName = pkg.getAttribute(attributes.servicePackageName);
      const packageValue = pkg.getAttribute(attributes.servicePackageValue);
      const packageUnits = pkg.getAttribute(attributes.servicePackageUnits);
      const packageCost = pkg.getAttribute(attributes.servicePackageCost);
      const packageParent = pkg.getAttribute(attributes.servicePackageParent);
      const service = this.allServices.find(
        (service) => service.slug === packageParent
      );
      const packageSlug = pkg.getAttribute(attributes.servicePackageSlug);
      if (service) {
        service.packages.push({
          name: packageName || "",
          value: parseInt(packageValue || "0"),
          units: packageUnits || "",
          cost: parseInt(packageCost || "0"),
          slug: packageSlug || "",
        });
      }
      this.allPackages.push({
        name: packageName || "",
        value: parseInt(packageValue || "0"),
        units: packageUnits || "",
        cost: parseInt(packageCost || "0"),
        slug: packageSlug || "",
      });
    });
  }

  private addEventListners() {
    //event listners for service packages, once a package is selected, it will be added to the cart
    const packagesCards = document.querySelectorAll(selectors.servicePackage);

    packagesCards.forEach((card) => {
      card.addEventListener("change", (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const value = (e.target as HTMLInputElement).value;
        const packageParent = card.getAttribute(
          attributes.servicePackageParent
        );

        if (packageParent) {
          const service = this.allServices.find(
            (service) => service.slug === packageParent
          );
          const packageFound = service?.packages.find(
            (pkg) => pkg.slug === value
          );
          if (service && packageFound) {
            addLineItem(service, packageFound);
          } else {
            console.error(
              "service or package not found",
              service,
              packageFound
            );
          }
        }
      });
    });

    //event listners for contract details form
    const submitterName = document.querySelector(
      selectors.submitterName
    ) as HTMLInputElement;
    const submitterEmail = document.querySelector(
      selectors.submitterEmail
    ) as HTMLInputElement;
    const isSubmitterAlsoSigner = document.querySelector(
      selectors.isSubmitterAlsoSigner
    ) as HTMLInputElement;
    const contractDetailsName = document.querySelector(
      selectors.contractDetailsName
    ) as HTMLInputElement;
    const contractDetailsAddress = document.querySelector(
      selectors.contractDetailsAddress
    ) as HTMLInputElement;
    const contractDetailsCompany = document.querySelector(
      selectors.contractDetailsCompany
    ) as HTMLInputElement;
    const contractDetailsCompanyLegalName = document.querySelector(
      selectors.contractDetailsCompanyLegalName
    ) as HTMLInputElement;

    //logic to show seperate contact name
    isSubmitterAlsoSigner.addEventListener("change", (e: Event) => {
      console.log("isSubmitterAlsoSigner event", e);
      const isChecked = (e.target as HTMLInputElement).checked;
      if (isChecked) {
        cart.value.isSubmitterAlsoSigner = true;
      } else {
        cart.value.isSubmitterAlsoSigner = false;
      }
    });

    //logic to save form data
    submitterName.addEventListener("change", (e: Event) => {
      e.preventDefault();
      const nameValue = (e.target as HTMLInputElement).value;
      cart.value.submitterDetails.name = nameValue;
    });
    submitterEmail.addEventListener("change", (e: Event) => {
      e.preventDefault();
      const emailValue = (e.target as HTMLInputElement).value;
      cart.value.submitterDetails.email = emailValue;
    });

    contractDetailsName.addEventListener("change", (e: Event) => {
      e.preventDefault();
      const nameValue = (e.target as HTMLInputElement).value;
      cart.value.contractDetails.name = nameValue;
    });
    contractDetailsAddress.addEventListener("change", (e: Event) => {
      e.preventDefault();
      const addressValue = (e.target as HTMLInputElement).value;
      cart.value.contractDetails.address = addressValue;
    });
    contractDetailsCompany.addEventListener("change", (e: Event) => {
      e.preventDefault();
      const companyValue = (e.target as HTMLInputElement).value;
      cart.value.contractDetails.company = companyValue;
    });
    contractDetailsCompanyLegalName.addEventListener("change", (e: Event) => {
      e.preventDefault();
      const companyLegalNameValue = (e.target as HTMLInputElement).value;
      cart.value.contractDetails.companyLegalName = companyLegalNameValue;
    });
  }

  private displayCurrentForm() {
    effect(() => {
      const currentStepValue = cart.value.currentStep;
      const forms = document.querySelectorAll(selectors.formStep);
      forms.forEach((form) => {
        if (
          form.getAttribute(attributes.formStepNumber) ===
          currentStepValue.toString()
        ) {
          (form as HTMLElement).style.display = "block";
        } else {
          (form as HTMLElement).style.display = "none";
        }
      });
    });

    this.navLinks.forEach((link: HTMLElement) => {
      link.addEventListener("click", () => {
        const step = link.getAttribute(attributes.navigateTo);
        if (step) {
          if (parseInt(step) < cart.value.currentStep) {
            cart.value.currentStep = parseInt(step);
          } else {
            //if step is the same as current step, do nothing
            return;
          }
        }
      });
    });
  }

  private renderSidebar() {
    const sideBarLists = document.querySelectorAll(
      selectors.sidebarList
    ) as NodeListOf<HTMLElement>;
    const sideBarItem = document.querySelector(
      selectors.sidebarListItem
    ) as HTMLElement;
    const listItemTemplate = sideBarItem.cloneNode(true) as HTMLElement;
    const consitionalVisibilityElements = document.querySelectorAll(
      selectors.conditionalVisibility
    ) as NodeListOf<HTMLElement>;

    //rendering sidebar step navigation

    effect(() => {
      const currentStepValue = cart.value.currentStep;
      this.navLinks.forEach((link: HTMLElement) => {
        const linkNavigateStep = link.getAttribute(attributes.navigateTo);
        const checkbox = link.querySelector(
          selectors.sidebarLinkCheckbox
        ) as HTMLDivElement;
        if (linkNavigateStep && checkbox) {
          if (parseInt(linkNavigateStep) === currentStepValue) {
            link.classList.remove("is-disabled");
          } else {
            link.classList.add("is-disabled");
          }

          if (parseInt(linkNavigateStep) >= currentStepValue) {
            checkbox.classList.remove("is-checked");
          } else {
            checkbox.classList.add("is-checked");
          }

          consitionalVisibilityElements.forEach((element) => {
            const visibleOnStep = element.getAttribute(
              attributes.visibleOnStep
            );
            const stepInt = parseInt(visibleOnStep || "0");
            if (stepInt <= currentStepValue) {
              element.style.display = "block";
            } else {
              element.style.display = "none";
            }
          });
        }
      });
    });

    //rendering sidebar services list accordion

    effect(() => {
      if (cart.value) {
        const selectedServices = cart.value.selectedServices;
        if (selectedServices.length > 0) {
          sideBarLists.forEach((list) => {
            list.innerHTML = "";
            selectedServices.forEach((service) => {
              const newListItem = listItemTemplate.cloneNode(
                true
              ) as HTMLElement;
              const checkbox = newListItem.querySelector(
                selectors.sidebarListItemCheckbox
              ) as HTMLDivElement;
              const title = newListItem.querySelector(
                selectors.sidebarListItemTitle
              ) as HTMLDivElement;
              const relatedLineItem = cart.value?.lineItems.filter(
                (item) => item.service.slug === service.slug
              )[0];

              title.textContent = service.name;
              newListItem.setAttribute(
                "data-fs-navigate-to-service",
                service.slug
              );
              list.appendChild(newListItem);
              if (relatedLineItem?.servicePackage) {
                checkbox.style.opacity = "1";
                newListItem.addEventListener("click", () => {
                  cart.value.currentStep = 3;
                  cart.value.currentService = service;
                  cart.value.currentServiceIndex =
                    cart.value?.selectedServices.indexOf(service) || 0;
                });
              } else {
                checkbox.style.opacity = "0";
                newListItem.style.cursor = "not-allowed";
              }
            });
          });
        }
      }
    });
  }

  private renderServicePackages() {
    //rendering select packages page

    const buttonChooseNextService = document.querySelector(
      selectors.buttonChooseNextService
    ) as HTMLButtonElement;
    const buttonParent =
      buttonChooseNextService.parentElement as HTMLDivElement;
    const newButtonTemplate = buttonChooseNextService.cloneNode(
      true
    ) as HTMLButtonElement;
    const pickPreviousPackage = document.querySelector(
      selectors.pickPreviousPackage
    ) as HTMLButtonElement;
    const pickPreviousPackageTemplate = pickPreviousPackage.cloneNode(
      true
    ) as HTMLButtonElement;
    const pickPreviousPackageParent =
      pickPreviousPackage.parentElement as HTMLDivElement;
    const currentServiceName = document.querySelector(
      selectors.currentServiceName
    ) as HTMLDivElement;
    const currentServiceDescription = document.querySelector(
      selectors.currentServiceDescription
    ) as HTMLDivElement;
    const currentServiceWhatsIncluded = document.querySelector(
      selectors.currentServiceWhatsIncluded
    ) as HTMLDivElement;
    const currentServiceWhatsExcluded = document.querySelector(
      selectors.currentServiceWhatsExcluded
    ) as HTMLDivElement;

    effect(() => {
      if (cart.value.currentService) {
        const currentServiceValue = cart.value.currentService;
        const allPackagesCards = document.querySelectorAll(
          selectors.servicePackage
        ) as NodeListOf<HTMLElement>;
        const packagesForm = allPackagesCards[0]?.closest(
          selectors.formStep
        ) as HTMLFormElement;
        const formError = packagesForm?.querySelector(
          selectors.formError
        ) as HTMLDivElement;
        formError.style.display = "none";

        allPackagesCards.forEach((card) => {
          const packageParent = card.getAttribute(
            attributes.servicePackageParent
          );
          const isParentInSelectedServices =
            currentServiceValue.slug === packageParent;

          if (isParentInSelectedServices) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
        let nextService =
          cart.value?.selectedServices[cart.value.currentServiceIndex + 1];
        buttonParent.innerHTML = "";
        const newButton = newButtonTemplate.cloneNode(
          true
        ) as HTMLButtonElement;

        if (nextService) {
          newButton.textContent = "Next Service";
          buttonParent?.appendChild(newButton);
          newButton.addEventListener("click", () => {
            //check if user has selected a package for the current service
            const selectedPackage = cart.value?.lineItems.find(
              (item) => item.service.slug === currentServiceValue.slug
            );
            if (selectedPackage) {
              cart.value.currentServiceIndex++;
              cart.value.currentService = nextService;
            } else {
              formError.textContent = `Please select a package for ${currentServiceValue.name}`;
              formError.style.display = "block";
            }
          });
        } else {
          newButton.textContent = "Generate the contract";
          buttonParent?.appendChild(newButton);
          newButton.setAttribute("type", "submit");
        }

        pickPreviousPackageParent.innerHTML = "";
        const newPickPreviousPackage = pickPreviousPackageTemplate.cloneNode(
          true
        ) as HTMLButtonElement;
        pickPreviousPackageParent.appendChild(newPickPreviousPackage);
        if (cart.value.currentServiceIndex > 0) {
          newPickPreviousPackage.style.display = "";
          newPickPreviousPackage.addEventListener("click", () => {
            const previousService =
              cart.value?.selectedServices[cart.value.currentServiceIndex - 1];
            cart.value.currentServiceIndex--;
            cart.value.currentService = previousService;
          });
        } else {
          newPickPreviousPackage.style.display = "none";
        }

        currentServiceName.textContent = currentServiceValue.name;
        currentServiceDescription.textContent = currentServiceValue.description;
        currentServiceWhatsIncluded.textContent =
          currentServiceValue.whatsIncluded;
        currentServiceWhatsExcluded.textContent =
          currentServiceValue.whatsExcluded;
      }
    });

    const lineItemsLists = document.querySelectorAll(
      selectors.cartLineItemsList
    ) as NodeListOf<HTMLDivElement>;

    //rendering the line items

    lineItemsLists.forEach((list) => {
      const lineItem = list.querySelector(
        selectors.cartLineItem
      ) as HTMLDivElement;
      const lineItemTemplateClone = lineItem.cloneNode(true) as HTMLDivElement;
      const lineItemsListParent = list.closest(
        selectors.cartLineItemsListParent
      ) as HTMLDivElement | null;
      list.innerHTML = "";

      effect(() => {
        if (cart.value.lineItems.length > 0) {
          if (lineItemsListParent) {
            lineItemsListParent.style.display = "";
          }
          list.innerHTML = "";
          const lineItems = cart.value.lineItems;
          const selectedServices = cart.value.selectedServices;
          const sortedLineItems = selectedServices
            .map((service) => {
              return lineItems.find(
                (lineItem) => lineItem.service.slug === service.slug
              );
            })
            .sort((a, b) => {
              if (a && b) {
                const aIndex = selectedServices.indexOf(a.service);
                const bIndex = selectedServices.indexOf(b.service);
                return aIndex - bIndex;
              }
              return 0;
            })
            .filter((lineItem) => lineItem !== undefined);
          sortedLineItems.forEach((lineItem) => {
            const newLineItem = lineItemTemplateClone.cloneNode(
              true
            ) as HTMLDivElement;
            list.appendChild(newLineItem);
            const lineItemName = newLineItem.querySelector(
              selectors.cartLineItemName
            ) as HTMLDivElement;
            const lineItemTotal = newLineItem.querySelector(
              selectors.cartLineItemTotal
            ) as HTMLDivElement;
            if (lineItemName) {
              lineItemName.textContent = `${lineItem.servicePackage.value} ${lineItem.servicePackage.units} of ${lineItem.service.name}`;
            }
            if (lineItemTotal) {
              lineItemTotal.textContent = `$${lineItem.cost}`;
            }
          });
        } else {
          if (lineItemsListParent) {
            lineItemsListParent.style.display = "none";
          }
        }
      });
    });

    //rendering the total

    const cartTotalElements = document.querySelectorAll(
      selectors.cartTotal
    ) as NodeListOf<HTMLDivElement>;

    effect(() => {
      const newTotal = cart.value.total;
      const counterObj = { value: this.previousTotal };

      cartTotalElements.forEach((total) => {
        gsap.to(counterObj, {
          value: newTotal,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            total.textContent = `$${counterObj.value
              .toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
          },
          onComplete: () => {
            total.textContent = `$${newTotal
              .toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
          },
        });

        this.previousTotal = newTotal;
      });
    });
  }

  private renderContractDetails() {
    const contactFormHeading = document.querySelector(
      selectors.contractFormHeading
    ) as HTMLDivElement;
    const submitterName = document.querySelector(
      selectors.submitterName
    ) as HTMLInputElement;
    const submitterEmail = document.querySelector(
      selectors.submitterEmail
    ) as HTMLInputElement;
    const isSubmitterAlsoSigner = document.querySelector(
      selectors.isSubmitterAlsoSigner
    ) as HTMLInputElement;
    const seperateContactName = document.querySelector(
      selectors.seperateContactName
    ) as HTMLInputElement;
    const contractDetailsName = document.querySelector(
      selectors.contractDetailsName
    ) as HTMLInputElement;
    const contractDetailsAddress = document.querySelector(
      selectors.contractDetailsAddress
    ) as HTMLInputElement;
    const contractDetailsCompany = document.querySelector(
      selectors.contractDetailsCompany
    ) as HTMLInputElement;
    const contractDetailsCompanyLegalName = document.querySelector(
      selectors.contractDetailsCompanyLegalName
    ) as HTMLInputElement;

    effect(() => {
      submitterName.value = cart.value.submitterDetails.name;
      submitterEmail.value = cart.value.submitterDetails.email;
      contractDetailsName.value = cart.value.contractDetails.name;
      contractDetailsAddress.value = cart.value.contractDetails.address;
      contractDetailsCompany.value = cart.value.contractDetails.company;
      contractDetailsCompanyLegalName.value =
        cart.value.contractDetails.companyLegalName;
      isSubmitterAlsoSigner.checked = cart.value.isSubmitterAlsoSigner;
    });

    effect(() => {
      if (cart.value.isSubmitterAlsoSigner) {
        seperateContactName.style.display = "none";
        contactFormHeading.textContent = "Contract Details";
        cart.value.contractDetails.name = cart.value.submitterDetails.name;
      } else {
        seperateContactName.style.display = "block";
        contactFormHeading.textContent = "Your Details";
      }
    });
  }
}
