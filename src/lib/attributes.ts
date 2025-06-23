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

  //cart
  cartLineItem: `[${prefix}=line-item]`,
  cartLineItemName: `[${prefix}=line-item-name]`,
  cartLineItemTotal: `[${prefix}=line-item-total]`,
  cartLineItemsList: `[${prefix}=line-items-list]`,
  cartLineItemsListParent: `[${prefix}=line-items-list-parent]`,
  cartTotal: `[${prefix}=total]`,

  //sidebar
  sidebarLink: `[${prefix}=sidebar-link]`,
  sidebarLinkCheckbox: `[${prefix}=sidebar-link-checkbox]`,
  sidebarList: `[${prefix}=sidebar-list]`,
  sidebarListItem: `[${prefix}=sidebar-list-item]`,
  sidebarListItemCheckbox: `[${prefix}=sidebar-list-item-checkbox]`,
  sidebarListItemTitle: `[${prefix}=sidebar-list-item-title]`,

  //contract details
  contractFormHeading: `[${prefix}=contact-details-form-heading]`,
  submitterName: `[${prefix}=submitter-name]`,
  submitterEmail: `[${prefix}=submitter-email]`,
  isSubmitterAlsoSigner: `[${prefix}=is-submitter-also-signer]`,
  seperateContactName: `[${prefix}=seperate-contact-name]`,
  contractDetailsName: `[${prefix}=contract-details-name]`,
  contractDetailsAddress: `[${prefix}=contract-details-address]`,
  contractDetailsCompany: `[${prefix}=contract-details-company]`,
  contractDetailsCompanyLegalName: `[${prefix}=contract-details-company-legal-name]`,

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
  servicePackageSlug: `data-fs-service-package-slug`,

  //sidebar
  navigateTo: `data-fs-navigate-to`,
  navigateToService: `data-fs-navigate-to-service`,

  //utils
  visibleOnStep: `data-fs-visible-on-step`,
};
