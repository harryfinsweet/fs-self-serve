import { selectors, attributes } from "@lib/attributes";
import { cart, bulkOverwriteServicesToCart } from "@/stores/cart";
import type { Service, Package } from "@/stores/cart";
import { ref, effect } from "@vue/reactivity";

const currentStep = ref(1);
const currentService = ref<Service | undefined>(undefined);
const currentServiceIndex = ref(0);

export class SelfServe {
  currentStep: number;
  allServices: Service[];
  allPackages: Package[];
  navLinks: NodeListOf<HTMLElement>;

  constructor() {
    const allForms = document.querySelectorAll(selectors.formStep);

    this.currentStep = currentStep.value;
    this.allServices = [];
    this.allPackages = [];
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

    this.loadAllServices();
    this.displayCurrentForm();
    this.renderSidebar();
    this.renderServicePackages();
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
        this.validateStep2(formData);
        break;
      case 3:
        this.validateStep3(formData);
        break;
    }
  }

  private validateStep1() {
    currentStep.value++;
  }

  private validateStep2(formData: FormData) {
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
    bulkOverwriteServicesToCart(services);
    currentService.value = services[0];
    currentServiceIndex.value = 0;
    currentStep.value++;
  }

  private validateStep3(formData: FormData) {
    const data = Object.fromEntries(formData) as {
      [key: string]: string;
    };
    console.log(data);
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
        whatsIcluded: serviceWhatsIncluded?.textContent || "",
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
      if (service) {
        service.packages.push({
          name: packageName || "",
          value: parseInt(packageValue || "0"),
          units: parseInt(packageUnits || "0"),
          cost: parseInt(packageCost || "0"),
        });
      }
      this.allPackages.push({
        name: packageName || "",
        value: parseInt(packageValue || "0"),
        units: parseInt(packageUnits || "0"),
        cost: parseInt(packageCost || "0"),
      });
    });
  }

  private displayCurrentForm() {
    effect(() => {
      const currentStepValue = currentStep.value;
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
          if (parseInt(step) < currentStep.value) {
            currentStep.value = parseInt(step);
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

    effect(() => {
      const currentStepValue = currentStep.value;
      this.navLinks.forEach((link: HTMLElement) => {
        const linkNavigateStep = link.getAttribute(attributes.navigateTo);
        const checkbox = link.querySelector(
          selectors.sidebarLinkCheckbox
        ) as HTMLDivElement;
        if (linkNavigateStep) {
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

    effect(() => {
      if (cart.value) {
        const selectedServices = cart.value.selectedServices;
        if (selectedServices.length > 0) {
          sideBarLists.forEach((list) => {
            list.innerHTML = "";
          });
          selectedServices.forEach((service) => {
            const newListItem = listItemTemplate.cloneNode(true) as HTMLElement;
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
            newListItem.addEventListener("click", () => {
              console.log("clicked on service", service);
              currentService.value = service;
              currentServiceIndex.value =
                cart.value?.selectedServices.indexOf(service) || 0;
            });
            sideBarLists.forEach((list) => {
              const clonedItem = newListItem.cloneNode(true) as HTMLElement;
              list.appendChild(clonedItem);
            });
            if (relatedLineItem?.servicePackage) {
              checkbox.style.opacity = "1";
            } else {
              checkbox.style.opacity = "0";
            }
          });
        }
      }
    });
  }

  private renderServicePackages() {
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
      if (currentService.value) {
        const currentServiceValue = currentService.value;
        const allPackagesCards = document.querySelectorAll(
          selectors.servicePackage
        ) as NodeListOf<HTMLElement>;
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
          cart.value?.selectedServices[currentServiceIndex.value + 1];
        buttonParent.innerHTML = "";
        const newButton = newButtonTemplate.cloneNode(
          true
        ) as HTMLButtonElement;
        if (nextService) {
          newButton.textContent = "Next Service";
          buttonParent?.appendChild(newButton);
          newButton.addEventListener("click", () => {
            currentServiceIndex.value++;
            currentService.value = nextService;
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
        if (currentServiceIndex.value > 0) {
          newPickPreviousPackage.style.display = "";
          newPickPreviousPackage.addEventListener("click", () => {
            const previousService =
              cart.value?.selectedServices[currentServiceIndex.value - 1];
            currentServiceIndex.value--;
            currentService.value = previousService;
          });
        } else {
          newPickPreviousPackage.style.display = "none";
        }

        currentServiceName.textContent = currentServiceValue.name;
        currentServiceDescription.textContent = currentServiceValue.description;
        currentServiceWhatsIncluded.textContent =
          currentServiceValue.whatsIcluded;
        currentServiceWhatsExcluded.textContent =
          currentServiceValue.whatsExcluded;
      }
    });
  }
}
