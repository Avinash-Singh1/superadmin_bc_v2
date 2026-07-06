export class URLConstant {
  //onboarding apis

  // Doctor KYC review
  public static kycList = "v1/admin/kyc";
  public static kycDetail = "v1/admin/kyc/"; // append :userId
  public static kycApprove = "v1/admin/kyc/"; // append :userId/approve
  public static kycReject = "v1/admin/kyc/";  // append :userId/reject

  // Payments dashboard
  public static paymentsList = "v1/admin/payments";
  public static paymentsSummary = "v1/admin/payments/summary";
  public static paymentsDetail = "v1/admin/payments/";        // append :id
  public static paymentsRefund = "v1/admin/payments/";        // append :id/refund
  public static paymentsReceipt = "v1/admin/payments/";       // append :id/receipt

  // Doctor payouts
  public static payoutsEligible = "v1/admin/payouts/eligible";
  public static payoutsSummary = "v1/admin/payouts/summary";
  public static payoutsList = "v1/admin/payouts";
  public static payoutsDetail = "v1/admin/payouts/";          // append :id
  public static payoutsInitiate = "v1/admin/payouts";
  public static payoutsMark = "v1/admin/payouts/";            // append :id/mark
  public static payoutsCancel = "v1/admin/payouts/";          // append :id/cancel

  // Reconciliation reports
  public static reportsSummary = "v1/admin/reports/summary";
  public static reportsPaymentsCsv = "v1/admin/reports/payments.csv";
  public static reportsRefundsCsv = "v1/admin/reports/refunds.csv";
  public static reportsPayoutsCsv = "v1/admin/reports/payouts.csv";
  public static reportsCommissionCsv = "v1/admin/reports/commission.csv";

  // Feature Announcements
  public static announcementsSend = "v1/admin/announcements/send";
  public static announcementsSendTest = "v1/admin/announcements/send-test";
  public static announcementsList = "v1/admin/announcements";
  public static announcementsDoctorCities = "v1/admin/announcements/doctor-cities";
  public static announcementsSpecializations = "v1/admin/announcements/specializations";

  public static login = "v1/admin/admin-login";
  public static forgotPassword = "v1/admin/admin-forgot-password";
  public static patientList = "v1/patient/admin";
  public static doctorList = "v1/doctor/admin-doctor-list";
  public static hospitalList = "v1/hospital/admin/list";
  public static importDoctorList = "v1/common/import/doctor";
  public static importHospitalList = "v1/common/import/hospital";
  public static addDoctor = "v1/doctor/admin-add-doctor";
  public static editDoctor = "v1/doctor/admin-edit-doctor";
  public static deleteDoctor = "v1/doctor/admin-delete-doctor";
  public static deletepatient = "v1/doctor/admin-delete-doctor-patient";
  public static addHospital = "v1/hospital/admin";
  public static deleteHospital = "v1/hospital/admin";
  public static specialization = "v1/master/specialization";
  public static procedure = "v1/master/procedure";
  public static cityList = "v1/city/all-city";
  public static masterData = "v1/master/hospital-type";
  public static doctorProfile = "v1/doctor/get-doctor-profile";
  public static state = "v1/master/state";
  public static appointmentList = "v1/appointment/list";
  public static doctorApprovalList = "v1/doctor/doctor-approval-list";
  public static changeDoctorStatus = "v1/doctor/admin-action-doctor";
  public static viewDoctorApproval = "v1/hospital/view-doctor-profile";
  public static viewHospitalApproval = "v1/hospital/hospital-approve-list";
  public static viewHospitalDetail = "v1/hospital/admin-view-hospital";
  public static changeStatusHospital = "v1/hospital/admin-action-hospital";
  public static deletedpatientDoctorHospital =
    "v1/admin/get-all-user-type-status";
  public static review = "v1/admin/feedbacks";
  public static activeInactiveDoctor = "v1/doctor/admin-active-inactive";
  public static viewRejectedDoctor = "v1/admin/get-user-details";
  public static viewReviewApproved = "v1/admin/feedbacks-details";
  public static deleteApprovedReview = "v1/admin/feedbacks";
  public static fileupload = "v1/common";
  public static profileDetail = "v1/admin/get-profile";
  public static updateProfile = "v1/admin/update-profile";
  public static changePassword = "v1/admin/update-admin-password";
  public static faqList = "v1/faq/all-faq";
  public static addFaq = "v1/faq";
  public static socialList = "v1/admin/social";
  public static getSocialName = "v1/master/social-media";
  public static visitHospital = "v1/common/hospital-for-address";
  public static dashboardCards = "v1/admin/dashboard/count";
  public static dashBoardAppointmentCharts =
    "v1/admin/dashboard/appointment-count";
  public static checkExistNumber = "v1/auth/check-number";
  public static registration = "v1/admin/dashboard/registration/count";
  public static appointment =
    "v1/admin/dashboard/appointment-surgery-lead/count";
  public static DoctorDashboardList = "v1/admin/doctor-verified-list";
  public static surgeryLead = "v1/surgery/all-surgery";
  public static surgeryServiceList = "v1/master/surgery";
  public static surgeryLeadList = "v1/surgery/all-enquires";
  public static surgeryLeadChange = "v1/surgery/enquire";
  public static masterSurgerylist = "v1/surgery/all-surgery";

  // Prescription APIs
  public static adminPrescriptionList = "v1/prescription/admin/all";
  public static adminPrescriptionById = "v1/prescription/admin";
  public static adminPrescriptionUploadFile = "v1/prescription/admin";
  public static adminPrescriptionStats = "v1/prescription/admin/stats";
  public static addSurgery = "v1/surgery";
  public static fetchUrlMeta = "v1/surgery/fetch-url-meta";
  public static treatmentCity = "v1/surgery/treatment-city";
  public static treatmentCities = "v1/surgery/treatment-cities";
  public static doctorSearch = "v1/admin/doctor-verified-list";
  public static appointmentToolTip =
    "v1/admin/dashboard/appointment-surgery-lead/count/range-specialization";
  public static notification = "v1/common/notification";
  public static master = "v1/master";
  public static department = "v1/surgery/department";
  public static surgeryFaq = "v1/surgery-faq/all-faq";
  public static surgeryFaqAdd = "v1/surgery-faq";
  public static logout = "v1/auth/logout";

  //imported
  public static addfaqList = "v1/faq";
  public static addVideos = "v1/video";
  public static social = "v1/master/social-media";
  public static hospitalType = "v1/master/hospital-type";

  public static updateDoctorProfile = "v1/setting/profile-admin";
  public static settingList = "v1/setting/list-admin";
  public static procedures = "v1/doctor/procedure-admin";
  public static doctorVideos = "v1/video/list";
  public static establishmentList = "v1/doctor/doctor-establishment-list-admin";
  public static establishmentRequestList =
    "v1/doctor/doctor-establishment-request-admin";
  public static addEstablishment = "v1/doctor/doctor-add-establishment-admin";
  public static editEstablishmentDetail =
    "v1/doctor/doctor-edit-establishment-admin";
  public static changeEstablishmentStatus =
    "v1/doctor/doctor-accept-establishment-admin";
  public static hospitalProfileDetail = "v1/hospital/hospital-profile-admin";
  public static updateHospitalProfile =
    "v1/hospital/hospital-update-profile-admin";
  public static serviceList = "v1/hospital/hospital-get-service-admin";
  public static addService = "v1/hospital/hospital-add-service-admin";
  public static deleteService = "v1/hospital/hospital-delete-service-admin";
  public static listFaqsHospital = "v1/hospital/hospital-faq-list-admin";
  public static faqListDoctor = "v1/doctor/doctor-faq-list-admin";
  public static addFaqs = "v1/hospital/hospital-add-faq-admin";
  public static editFaq = "v1/hospital/hospital-update-faq-admin";
  public static deleteFaq = "v1/hospital/hospital-delete-faq-admin";
  public static videoList = "v1/hospital/hospital-video-list-admin";
  public static addVideo = "v1/hospital/hospital-add-videos-admin";
  public static editVideo = "v1/hospital/hospital-update-videos-admin";
  public static deleteVideo = "v1/hospital/hospital-delete-videos-admin";
  public static hospitalTiming = "v1/hospital/hospital-get-timing-admin";
  public static addHospitalTiming = "v1/hospital/hospital-add-timing-admin";
  public static editHospitalTiming = "v1/hospital/hospital-update-timing-admin";
  public static getAddress = "v1/hospital/hospital-get-address-admin";
  public static editAddress = "v1/hospital/hospital-update-address-admin";
  public static getImagesList = "v1/hospital/hospital-get-images-admin";
  public static addImages = "v1/hospital/hospital-add-images-admin";
  public static deleteImages = "v1/hospital/hospital-delete-images-admin";
  public static socialListHospital = "v1/hospital/hospital-social-data-admin";
  public static addSocialMedia = "v1/hospital/hospital-add-social-admin";
  public static editSocialMedia = "v1/hospital/hospital-update-social-admin";
  public static deleteSocialMedia = "v1/hospital/hospital-delete-social-admin";
  public static doctorListHospital = "v1/hospital/doctor-list-admin";
  public static doctorRequestList = "v1/hospital/doctor-request-list-admin";
  public static doctorProfileHospital = "v1/hospital/view-doctor-profile";
  public static deleteDoctorHospital =
    "v1/hospital/hospital-remove-doctor-admin";
  public static editDoctorProfile = "v1/hospital/edit-doctor-profile-admin";
  public static changedoctorRequestStatus =
    "v1/hospital/hospital-accept-doctor-admin";
  public static doctorDetail = "v1/hospital/hospital-find-doctor";
  public static addDoctorHospital = "v1/hospital/hospital-add-doctor-admin";
  public static specialityList = "v1/hospital/speciality-admin";
  public static procedureList = "v1/hospital/procedure-admin";

  //not in use
  public static deleteAccount = "v1/hospital/hospital-delete-account";
}
