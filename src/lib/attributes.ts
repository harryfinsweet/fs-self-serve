const prefix = "data-fs-el";

//used to select elements
export const selectors = {
  //search bar
  formStep: `[${prefix}=form-step]`,
  formWrapper: `[${prefix}=form-wrapper]`,
  formStepVideo: `[${prefix}=form-step-video]`,
  formSuccess: `[${prefix}=form-success]`,
  service: `[${prefix}=service]`,
  serviceTitle: `[${prefix}=service-title]`,
  serviceDescription: `[${prefix}=service-description]`,
  serviceWhatsIncluded: `[${prefix}=whats-included]`,
  serviceWhatsExcluded: `[${prefix}=whats-not-included]`,
  servicePackage: `[${prefix}=service-package]`,
  buttonChooseNextService: `[${prefix}=choose-next-service]`,

  //current service
  currentServiceName: `[${prefix}=current-service-name]`,
  currentServiceDescription: `[${prefix}=current-service-description]`,
  currentServiceWhatsIncluded: `[${prefix}=current-service-whats-included]`,
  currentServiceWhatsExcluded: `[${prefix}=current-service-whats-excluded]`,
  pickPreviousPackage: `[${prefix}=pick-previous-package]`,

  //sidebar
  sidebarLink: `[${prefix}=sidebar-link]`,
  sidebarLinkCheckbox: `[${prefix}=sidebar-link-checkbox]`,
  sidebarList: `[${prefix}=sidebar-list]`,
  sidebarListItem: `[${prefix}=sidebar-list-item]`,
  sidebarListItemCheckbox: `[${prefix}=sidebar-list-item-checkbox]`,
  sidebarListItemTitle: `[${prefix}=sidebar-list-item-title]`,

  //utils
  conditionalVisibility: `[${prefix}=conditional-visibility]`,
};

//used to get attibute values
export const attributes = {
  formStepNumber: `data-fs-form-step-number`,
  servicePackageName: `data-fs-service-package-name`,
  servicePackageValue: `data-fs-service-package-value`,
  servicePackageUnits: `data-fs-service-package-units`,
  servicePackageCost: `data-fs-service-package-cost`,
  servicePackageParent: `data-fs-service-package-parent`,

  //sidebar
  navigateTo: `data-fs-navigate-to`,
  navigateToService: `data-fs-navigate-to-service`,

  //utils
  visibleOnStep: `data-fs-visible-on-step`,
};
