import { ref, effect } from "@vue/reactivity";

const storedCart = localStorage.getItem("cart");
const cart = ref<Cart>(
  storedCart
    ? JSON.parse(storedCart)
    : {
        lineItems: [],
        total: 0,
        contractDetails: {
          name: "",
          address: "",
          company: "",
          companyLegalName: "",
        },
        selectedServices: [],
        submitorDetails: {
          name: "",
          email: "",
        },
        isSubmitterAlsoSigner: false,
        currentStep: 1,
        currentService: undefined,
        currentServiceIndex: 0,
      }
);

effect(() => {
  //save cart to local storage
  localStorage.setItem("cart", JSON.stringify(cart.value));

  //calculate total
  if (cart.value) {
    cart.value.total = cart.value.lineItems.reduce(
      (acc, item) => acc + item.cost,
      0
    );
  }
});

const bulkOverwriteServicesToCart = (services: Service[]) => {
  if (!cart.value) {
    console.error("Cart not found");
    return;
  }
  cart.value.selectedServices = services;
};

const addServiceToCart = (service: Service) => {
  console.log("addServiceToCart", service);
  if (!cart.value) {
    console.error("Cart not found");
    return;
  }

  //replace service if it already exists
  cart.value.selectedServices = cart.value.selectedServices.filter(
    (s) => s.slug !== service.slug
  );
  cart.value.selectedServices.push(service);
};

const removeServiceFromCart = (service: Service) => {
  if (!cart.value) {
    console.error("Cart not found");
    return;
  }
  cart.value.selectedServices = cart.value.selectedServices.filter(
    (s) => s !== service
  );
};

const addLineItem = (service: Service, servicePackage: Package) => {
  if (!cart.value) {
    console.error("Cart not found");
    return;
  }
  const lineItemWithSameService = cart.value.lineItems.find(
    (item) => item.service.slug === service.slug
  );
  if (lineItemWithSameService) {
    //remove the line item
    cart.value.lineItems = cart.value.lineItems.filter(
      (item) => item.service.slug !== service.slug
    );
  }
  cart.value.lineItems.push({
    service,
    servicePackage,
    units: 1,
    cost: servicePackage.cost,
  });
};

const removeLineItem = (service: Service, servicePackage: Package) => {
  if (!cart.value) {
    console.error("Cart not found");
    return;
  }
  cart.value.lineItems = cart.value.lineItems.filter(
    (item) => item.service !== service || item.servicePackage !== servicePackage
  );
};

export {
  cart,
  addLineItem,
  removeLineItem,
  addServiceToCart,
  removeServiceFromCart,
  bulkOverwriteServicesToCart,
};

type Cart = {
  lineItems: LineItem[];
  selectedServices: Service[];
  total: number;
  contractDetails: ContractDetails;
  submitorDetails: SubmitorDetails;
  isSubmitterAlsoSigner: boolean;
  currentStep: number;
  currentService: Service | undefined;
  currentServiceIndex: number;
};

type LineItem = {
  service: Service;
  servicePackage: Package;
  units: number;
  cost: number;
};

export type Service = {
  name: string;
  description: string;
  whatsIcluded: string;
  whatsExcluded: string;
  slug: string;
  packages: Package[];
};

export type Package = {
  name: string;
  value: number;
  units: string;
  cost: number;
  slug: string;
};

type ContractDetails = {
  name: string;
  address: string;
  company: string;
  companyLegalName: string;
};

type SubmitorDetails = {
  name: string;
  email: string;
};
