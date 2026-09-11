import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { URLConstant } from "src/app/apisURL/url";
import { ROUTE_CONSTANT } from "src/app/constant/routeconstant";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  constructor(
    private route: Router,
    public activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {}

  status: boolean = true;
  @Input() toggle: any;

  menuList = [
    {
      label: "DASHBOARD",
      icon: "assets/images/svg/dashboard.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.DASHBOARD}`,
      section: "OVERVIEW",
    },
    {
      label: "APPOINTMENT",
      icon: "assets/images/svg/appointment.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.APPOINTMENT}`,
      section: "CARE OPERATIONS",
    },
    {
      label: "PROFILE VISITS",
      icon: "assets/images/svg/appointment.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.APPOINTMENT}/visits`,
      section: "CARE OPERATIONS",
    },
    {
      label: "PATIENTS",
      icon: "assets/images/svg/patient.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.PATIENT}`,
    },
    {
      label: "DOCTORS/HOSPITALS",
      icon: "assets/images/svg/doctors.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.DOCTOR_HOSPITAL}`,
    },
    {
      label: "Doctor KYC",
      icon: "assets/images/svg/settings.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.KYC}`,
    },
    {
      label: "REQUEST_FOR_APPROVAL",
      icon: "assets/images/svg/approval.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.REQUEST_APPROVAL}`,
    },
    {
      label: "REVIEW",
      icon: "assets/images/svg/review.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.REVIEW}`,
    },
    {
      label: "PRESCRIPTIONS",
      icon: "assets/images/svg/prescription.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.PRESCRIPTION}`,
      section: "CLINICAL CONTENT",
    },
    {
      label: "SPECIALITY/PROCEDURE",
      icon: "assets/images/svg/speciality.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SPECIALITY_PROCEDURE}`,
    },
    {
      label: "SURGERY_CARE",
      icon: "assets/images/svg/surgerycare.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SURGERY.SURGERY}`,
      section: "",
      dropdown: true,
      collapse: false,
      dropdownIcon: "assets/images/svg/dropdown.svg",
      list: [
        {
          label: "SURGERY_LEAD",
          icon: "assets/images/svg/surgerycare.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SURGERY.SURGERY}/${ROUTE_CONSTANT.SURGERY.LEAD_LIST}`,
        },
        {
          label: "ADD_SURGERY",
          icon: "assets/images/svg/add-surgery.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SURGERY.SURGERY}/${ROUTE_CONSTANT.SURGERY.ADD_SURGERY}`,
        },
        {
          label: "SURGERY_LIST",
          icon: "assets/images/svg/surgery-list.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SURGERY.SURGERY}/${ROUTE_CONSTANT.SURGERY.SURGERY_LIST}`,
        },
      ],
    },
    {
      label: "Payments",
      icon: "assets/images/svg/appointment.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.PAYMENTS}`,
      section: "FINANCE",
    },
    {
      label: "Payouts",
      icon: "assets/images/svg/dashboard.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.PAYOUTS}`,
    },
    {
      label: "Reports",
      icon: "assets/images/svg/review.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.REPORTS}`,
    },
    {
      label: "Feature Announcements",
      icon: "assets/images/svg/approval.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.FEATURE_ANNOUNCEMENTS}`,
      section: "PUBLISHING",
    },
    {
      label: "Blog Management",
      icon: "assets/images/svg/mat-blog.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/blog-management`,
      section: "",
      dropdown: true,
      collapse: false,
      dropdownIcon: "assets/images/svg/dropdown.svg",
      list: [
        {
          label: "Dashboard",
          icon: "assets/images/svg/dashboard.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/blog-management/dashboard`,
        },
        {
          label: "Blog Posts",
          icon: "assets/images/svg/review.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/blog-management/blog-list`,
        },
        {
          label: "Categories",
          icon: "assets/images/svg/speciality.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/blog-management/category-list`,
        },
        {
          label: "Tags",
          icon: "assets/images/svg/prescription.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/blog-management/tag-list`,
        },
        {
          label: "Authors",
          icon: "assets/images/svg/doctors.svg",
          routerLink: `/${ROUTE_CONSTANT.THEME}/blog-management/author-list`,
        },
      ],
    },
    {
      label: "Sync Sitemap ",
      icon: "assets/images/svg/sync_2.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SYNC_SITEMAP}`,
      section: "ADMINISTRATION",
    },
    {
      label: "Black List Users",
      icon: "assets/images/svg/sync_2.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.BLACKLIST}`,
    },
    {
      label: "DELETED/REJECTED/INACTIVE",
      icon: "assets/images/svg/delete.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.DELETE_REJECT_INACTIVE}`,
    },
    {
      label: "SETTINGS",
      icon: "assets/images/svg/settings.svg",
      routerLink: `/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.SETTINGS}`,
    },
  ];
  settingbackGround: boolean = false;
  settingRoute() {
    this.settingbackGround = true;
    this.route.navigate(["/theme/settings"]);
  }
  data: any = [];
  open: boolean = true;
  close: boolean = false;

  logout() {
    this.apiService.Postdata(URLConstant.logout, {}, {}).subscribe({
      next: (res: any) => {
        localStorage.clear();
        this.route.navigate(["/"]);
      },
    });
  }
}
