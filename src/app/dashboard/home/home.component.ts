import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { Chart, registerables } from "chart.js";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { MatDialog } from "@angular/material/dialog";
import { AcceptRejectComponent } from "src/app/dialogs/accept-reject/accept-reject.component";
import { MatSelect } from "@angular/material/select";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    public fb: UntypedFormBuilder,
    public apiservice: ApiService,
    public datepipe: DatePipe,
    public toastr: ToastrService,
    public dialog: MatDialog
  ) {
    Chart.register(...registerables);
  }

  filterForm: any;
  foods = [
    { value: "steak-0", viewValue: "Steak" },
    { value: "pizza-1", viewValue: "Pizza" },
    { value: "tacos-2", viewValue: "Tacos" },
  ];
  hospital: boolean = false;
  age: boolean = false;
  bloodGroup: boolean = false;
  cityListing: any;
  getBothValues: any;
  typeOfHospital: any;
  OccupationList: any;
  doctorsList: boolean = true;
  hospitalsList: boolean = true;
  appointmentchart: any;
  registrationchart: any;
  appointmentCount: any;
  surgeryCount: any;
  patientCount: any;
  doctorCount: any;
  hospitalCount: any;
  ListedCards: any;
  appointmentStartDate: any;
  appointmentEndDate: any;
  appointmentsCount: any = [];
  chart: any;
  all: boolean = true;
  doctor: boolean = false;
  hospitaldata: boolean = false;
  todayStartDate: any;
  todayEndDate: any;

  globalFilter = [
    {
      time: "Today",
      value: "Today",
      id: 7,
    },
    {
      time: "Yesterday",
      value: "Yesterday",
      id: 6,
    },
    {
      time: "Last 7 Days",
      value: "Last 7 Days",
      id: 5,
    },
    {
      time: "Last 28 Days",
      value: "Last 28 Days",
      id: 4,
    },
    {
      time: "Last 60 Days",
      value: "Last 60 Days",
      id: 3,
    },
    {
      time: "Last 90 Days",
      value: "Last 90 Days",
      id: 2,
    },
    // {
    //   time: '' ,
    //   value: 'Date Range',
    //   id:1
    // },
  ];
  selected = "Today";
  selected1 = "Today";

  arr: any = [30, 20, 35, 15];
  chartValues = ["Data1", "Data2", "Data3", "Data4"];
  color: any = ["#C6C7F8", "black", "#BAEDBD", "#95A4FC"];
  ngOnInit(): void {
    this.cardsDetail();
    this.appointmentToolTip();
    this.specializationList();
    this.hospitalList();
    this.surgeryLeadList();
    this.typeOfHospitalList();
    this.rightChartsDetail();
    this.appointmentChart();
    this.registrationChart();
    this.downloadPatient();
    this.notification();
    // this.downloadSurgery()
  }

  checkDate() {
    if (this.todayStartDate && this.todayEndDate) {
      return `${this.todayStartDate + "-" + this.todayEndDate}`;
    } else {
      return ``;
    }
  }

  byDefaultFilter: boolean = false;
  cardsDetail() {
    var todatDate = new Date();
    var currentTime = new Date();
    todatDate.setHours(0);
    todatDate.setMinutes(0);
    todatDate.setSeconds(0);
    todatDate.setMilliseconds(0);
    currentTime.setUTCHours(18, 30, 0, 0);
    this.todayEndDate = currentTime.toISOString();
    this.todayStartDate = todatDate.toISOString();

    let param: any = {
      startDate:
        this.byDefaultFilter == false
          ? this.todayStartDate
          : this.byDefaultFilter == true
          ? this.fromDate
          : "",
      endDate:
        this.byDefaultFilter == false
          ? this.todayEndDate
          : this.byDefaultFilter == true
          ? this.toDate
          : "",
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.dashboardCards, param)
      .subscribe((res: any) => {
        if (res?.success == true) {
          (this.surgeryCount = res?.result?.surgeryEnquiryCount),
            (this.patientCount = res?.result?.patientCount);
          this.doctorCount = res?.result?.doctorCount;
          this.hospitalCount = res?.result?.hospitalCount;
          this.appointmentCount = res?.result?.appointmentCount;
          this.ListedCards = [
            {
              header: "Appointments",
              count: this.appointmentCount,
              img: "assets/images/svg/appintment.svg",
              percentage: res?.result?.appointmentPercentDiff,
            },
            {
              header: "Surgery Lead",
              count: this.surgeryCount,
              img: "assets/images/svg/surgery.svg",
              percentage: res?.result?.enquiryPercentDiff,
            },
            {
              header: "Patients Reg.",
              count: this.patientCount,
              img: "assets/images/svg/patinet.svg",
              percentage: res?.result?.patientPercentDiff,
            },
            {
              header: "Doctors Reg.",
              count: this.doctorCount,
              img: "assets/images/svg/doctorsapp.svg",
              percentage: res?.result?.doctorPercentDiff,
            },
            {
              header: "Hospitals Reg.",
              count: this.hospitalCount,
              img: "assets/images/svg/doctorsapp.svg",
              percentage: res?.result?.hospitalPercentDiff,
            },
          ];
        }
      });
  }

  appointmentByCity: any;
  appointmentByOS: any;
  appointmentByBrowser: any;
  appointmentGender: any;
  appointmentByDevice: any;

  rightChartsDetail() {
    this.apiservice
      .GetData(URLConstant.dashBoardAppointmentCharts, "")
      .subscribe((res: any) => {
        this.appointmentGender = res?.result?.appointmentCountByGender;
        this.appointmentByCity = res?.result?.appointmentCountByCity;
        this.appointmentByOS = res?.result?.appointmentCountByOS;
        this.appointmentByBrowser = res?.result?.appointmentCountByBrowser;
        this.appointmentByDevice = res?.result?.appointmentCountByDevice;
        if (res?.success == true) {
          this.dougnnutChart();
          this.appointmentBYOS();
          this.appointmentBYBrowser();
          this.appointmentBYGender();
          this.appointmentBYDevice();
        }
      });
  }
  appointmentPercentage: any = [];
  appointmentcities: any = [];
  dougnnutChart() {
    var appointmentCount = [];
    var cityName = [];

    for (let i = 0; i < this.appointmentByCity.length; i++) {
      this.appointmentcities.push([
        this.appointmentByCity[i]?.cities?.city,
        this.appointmentByCity[i]?.cities?.count,
        this.appointmentByCity[i]?.percentage,
        this.appointmentByCity[i]?.total,
      ]);

      appointmentCount.push(this.appointmentByCity[i]?.cities?.count);
      cityName.push(this.appointmentByCity[i]?.cities?.city);
      this.appointmentPercentage.push(this.appointmentByCity[i]?.percentage);
    }
    this.chart = new Chart("canvas", {
      type: "doughnut",
      data: {
        labels: cityName,
        datasets: [
          {
            data: appointmentCount,
            backgroundColor: this.color,
            borderWidth: 3,
            borderRadius: {
              outerStart: 100,
              innerStart: 100,
              outerEnd: -100,
              innerEnd: -100,
            },
          },
        ],
      },
      options: {
        cutout: "60%",

        plugins: {
          legend: {
            position: "right",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
            },
          },
        },
      },

      // options: {
      //   legend: {
      //     display: false
      //   }
      //   tooltips:{
      //     enabled:false
      //   }
      // }
    });
  }

  dataSourceHospital: any;
  getHospitalList: any = [];
  hospitalList() {
    this.apiservice.GetData(URLConstant.visitHospital, "").subscribe(
      (res: any) => {
        this.dataSourceHospital = res?.result?.data;
        // for (let i = 0; i < this.dataSourceHospital.length; i++) {
        //   this.getHospitalList.push(this.dataSourceHospital[i]?.hospitalName)
        // }
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }
  surgeryList: any;
  getSurgerList: any = [];
  surgeryLeadList() {
    this.apiservice.GetData(URLConstant.surgeryLead, "").subscribe(
      (res: any) => {
        this.surgeryList = res?.result?.data;
        for (let i = 0; i < this.surgeryList.length; i++) {
          this.getSurgerList.push(this.surgeryList[i]?.title);
        }
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }
  surgeryDetail: any = [];
  appointmentDate: any = [];
  userDetail: any = [];

  appointmentChart() {
    this.surgeryDetail = [];
    var mapdata: any = [];
    this.appointmentsCount = [];
    this.appointmentDate = [];
    var todatDate = new Date();
    var currentTime = new Date();
    todatDate.setHours(0);
    todatDate.setMinutes(0);
    todatDate.setSeconds(0);
    todatDate.setMilliseconds(0);
    currentTime.setUTCHours(18, 30, 0, 0);
    this.appointmentEndDate = currentTime.toISOString();
    this.appointmentStartDate = todatDate.toISOString();
    let param: any = {
      startDate:
        this.byDefaultFilter == false
          ? this.appointmentStartDate
          : this.byDefaultFilter == true
          ? this.fromDate
          : "",
      endDate:
        this.byDefaultFilter == false
          ? this.appointmentEndDate
          : this.byDefaultFilter == true
          ? this.toDate
          : "",
      typeOfList: this.appointmentHeader == true ? 1 : 2,
      specialization: this.specializationParam,
      doctors: this.doctorParam,
      hospitals: this.hospitalParam,
      surgeryTypes: this.surgeryParam,
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });

    if (param?.typeOfList == 2) {
      let param: any = {
        startDate:
          this.byDefaultFilter == false
            ? this.appointmentStartDate
            : this.byDefaultFilter == true
            ? this.fromDate
            : "",
        endDate:
          this.byDefaultFilter == false
            ? this.appointmentEndDate
            : this.byDefaultFilter == true
            ? this.toDate
            : "",
        typeOfList: 3,
        isExport: true,
      };
      let data: any = {
        startDate:
          this.byDefaultFilter == false
            ? this.appointmentStartDate
            : this.byDefaultFilter == true
            ? this.fromDate
            : "",
        endDate:
          this.byDefaultFilter == false
            ? this.appointmentEndDate
            : this.byDefaultFilter == true
            ? this.toDate
            : "",
        typeOfList: 3,
        isExport: true,
        surgeryTypes: this.surgeryParam,
        // forDashboard:true
      };
      Object.keys(param).forEach((key) => {
        if (
          param[key] === null ||
          param[key] === undefined ||
          param[key] === ""
        ) {
          delete param[key];
        }
      });
      Object.keys(data).forEach((key) => {
        if (data[key] === null || data[key] === undefined || data[key] === "") {
          delete data[key];
        }
      });

      this.apiservice
        .Postdata(URLConstant.surgeryLeadList, data, "")
        .subscribe((res: any) => {
          console.log("res1", res);
          let surgerydata = res?.result?.enquiryList?.data;

          for (let i = 0; i < surgerydata?.length; i++) {
            this.surgeryDetail.push([
              surgerydata[i]?.createdAt,
              surgerydata[i]?.source ? surgerydata[i]?.source : "N/A",
              surgerydata[i]?.name ? surgerydata[i]?.name : "N/A",
              surgerydata[i]?.phone ? surgerydata[i]?.phone : "N/A",
              surgerydata[i]?.surgeryMasterName
                ? surgerydata[i]?.surgeryMasterName
                : "N/A",
              surgerydata[i]?.city ? surgerydata[i]?.city : "N/A",
            ]);
          }
        });
    }

    this.apiservice
      .Postdata(URLConstant.appointment, param, "")
      .subscribe((res: any) => {
        for (let i = 0; i < res?.result?.length; i++) {
          for (
            let j = 0;
            j < res?.result[i]?.appointmentBySpecialization?.length;
            j++
          ) {
            mapdata.push(res?.result[i]?.appointmentBySpecialization[j]?.name);
          }

          this.appointmentsCount.push(res?.result[i]?.totalCount);
          this.appointmentDate.push(res?.result[i]?._id);
        }
        if (this.appointmentchart) this.appointmentchart?.destroy();
        const canvas = <HTMLCanvasElement>(
          document.getElementById("appointment")
        );
        if (canvas) {
          const ctx = canvas.getContext("2d");
          this.appointmentchart = new Chart("appointment", {
            type: "line",
            data: {
              labels: this.appointmentDate,
              datasets: [
                {
                  // label: 'My First Dataset',
                  data: this.appointmentsCount,
                  fill: false,
                  borderColor: "black",
                  borderWidth: 1,
                  tension: 0.1,
                  pointBackgroundColor: "black",
                  pointHoverBackgroundColor: "black",
                },
              ],
            },
            options: {
              elements: {
                point: {
                  radius: 7,
                  hoverRadius: 7,
                },
              },

              plugins: {
                tooltip: {
                  displayColors: false,
                  backgroundColor: "black",
                  bodyColor: "white",
                  borderColor: "1px solid black",

                  bodyFont: {
                    size: 16,
                    style: "normal",
                    weight: "normal",
                  },
                  callbacks: {
                    title: function (context) {
                      return;
                    },
                    label: function (context) {
                      let data = res?.result.filter((res: any) => {
                        return res?._id == context?.label;
                      });
                      console.log(data);
                      let userdetail: any = [];
                      let userCount: any = [];
                      let tooltipText = "";
                      let tooltipData: any = [];

                      data[0]?.appointmentBySpecialization?.forEach(
                        (el: any) => {
                          tooltipData.push(el?.name + "  :  " + el?.count);
                          userdetail.push(el?.name);
                          userCount.push(el?.count);
                        }
                      );
                      return tooltipData;
                    },
                  },
                },
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
              },

              // backgroundColor: 'rgba(251, 85, 85, 0.4)'
            },
          });
        }
      });
  }
  registrationStartdate: any;
  registrationEndDate: any;
  registerCount: any = [];
  registrationDetail: any = [];
  registrationdate: any = [];
  registrationChart() {
    this.registerCount = [];
    this.registrationDetail = [];
    this.registrationdate = [];
    this.registrationchart?.destroy();

    // get start date end date on US timing

    var todatDate = new Date();
    var currentTime = new Date();
    todatDate.setHours(0);
    todatDate.setMinutes(0);
    todatDate.setSeconds(0);
    todatDate.setMilliseconds(0);
    this.registrationEndDate = currentTime.toISOString();
    this.registrationStartdate = todatDate.toISOString();
    let param: any = {
      startDate:
        this.byDefaultFilter == false
          ? this.registrationStartdate
          : this.byDefaultFilter == true
          ? this.fromDate
          : "",
      endDate:
        this.byDefaultFilter == false
          ? this.registrationEndDate
          : this.byDefaultFilter == true
          ? this.toDate
          : "",
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.registration, param)
      .subscribe((res: any) => {
        if (res?.success == true) {
          for (let i = 0; i < res?.result?.totalCountUserType.length; i++) {
            this.registrationDetail.push([
              res?.result?.totalCountUserType[i]?._id == 1
                ? "Hospital"
                : res?.result?.totalCountUserType[i]?._id == 2
                ? "Doctor"
                : res?.result?.totalCountUserType[i]?._id == 3
                ? "Patient"
                : "",
              res?.result?.totalCountUserType[i]?.count,
            ]);
          }
          for (let i = 0; i < res?.result?.listForCountByDate.length; i++) {
            this.registerCount.push(
              res?.result?.listForCountByDate[i]?.totalCount
            );
            this.registrationdate.push(res?.result?.listForCountByDate[i]?._id);
          }
          var canvas = document.getElementById(
            "registration"
          ) as HTMLCanvasElement;
          var ctx = canvas?.getContext("2d");
          if (ctx) {
            var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
            gradientStroke.addColorStop(0, "#000000");
            gradientStroke.addColorStop(1, "#FFFFFF");

            this.registrationchart = new Chart("registration", {
              type: "line",
              data: {
                labels: this.registrationdate,
                datasets: [
                  {
                    data: this.registerCount,
                    backgroundColor: gradientStroke,
                    fill: true,
                    borderColor: "black",
                    borderWidth: 1,
                    tension: 0.1,
                  },
                ],
              },

              options: {
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              },
            });
          }
        }
      });
  }
  appointmentByOSChart: any;
  OSdetail: any = [];

  appointmentBYOS() {
    var appointmentCount = [];
    var OSname = [];
    for (let i = 0; i < this.appointmentByOS.length; i++) {
      this.OSdetail.push([
        this.appointmentByOS[i]?.count,
        this.appointmentByOS[i]?.os,
      ]);
      appointmentCount.push(this.appointmentByOS[i]?.count);
      OSname.push(this.appointmentByOS[i]?.os);
    }
    this.appointmentByOSChart = new Chart("appointmentByOS", {
      type: "bar",
      data: {
        labels: OSname,
        datasets: [
          {
            // label: 'My First Dataset',
            data: appointmentCount,
            backgroundColor: [
              "rgb(186,237,189)",
              "rgb(198,199,248)",
              "rgb(28,28,28)",
              "rgb(177,227,255)",
              "rgb(149,164,252)",
              "rgb(161,227,203)",
            ],
            borderRadius: 5,
            barThickness: 20,
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }
  appointmentByBrowserChart: any;
  browserDetail: any = [];
  appointmentBYBrowser() {
    var appointmentCount = [];
    var browsername = [];
    for (let i = 0; i < this.appointmentByBrowser.length; i++) {
      this.browserDetail.push([
        this.appointmentByBrowser[i]?.browser,
        this.appointmentByBrowser[i]?.count,
      ]);
      appointmentCount.push(this.appointmentByBrowser[i]?.count);
      browsername.push(this.appointmentByBrowser[i]?.browser);
    }

    this.appointmentByBrowserChart = new Chart("appointmentByBrowser", {
      type: "bar",
      data: {
        labels: browsername,
        datasets: [
          {
            // label: 'My First Dataset',
            data: appointmentCount,
            backgroundColor: [
              "rgb(186,237,189)",
              "rgb(198,199,248)",
              "rgb(28,28,28)",
              "rgb(177,227,255)",
              "rgb(149,164,252)",
              "rgb(161,227,203)",
            ],
            borderRadius: 5,
            barThickness: 20,
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }
  appointmentByGender: any;
  genderDetail: any = [];
  appointmentBYGender() {
    var genderCount = [];
    var genderName = [];

    for (let i = 0; i < this.appointmentGender.length; i++) {
      this.genderDetail.push([
        this.appointmentGender[i]?.gender,
        this.appointmentGender[i]?.count,
      ]);
      genderCount.push(this.appointmentGender[i]?.count);
      genderName.push(this.appointmentGender[i]?.gender);
    }
    this.appointmentByGender = new Chart("appointmentByGender", {
      type: "bar",
      data: {
        labels: genderName,
        datasets: [
          {
            label: "My First Dataset",
            data: genderCount,
            backgroundColor: ["rgb(28,28,28)", "rgb(149,164,252)"],
            borderRadius: 5,
            barThickness: 20,
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }
  datas: any = 35;
  appointmentByDevices: any;
  deviceDetail: any = [];
  appointmentBYDevice() {
    var DeviceCount = [];
    var DeviceName = [];

    for (let i = 0; i < this.appointmentByDevice.length; i++) {
      this.deviceDetail.push([
        this.appointmentByDevice[i]?.deviceType,
        this.appointmentByDevice[i]?.count,
      ]);
      DeviceCount.push(this.appointmentByDevice[i]?.count);
      DeviceName.push(this.appointmentByDevice[i]?.deviceType);
    }

    this.appointmentByDevices = new Chart("appointmentByDevice", {
      type: "bar",
      data: {
        labels: DeviceName,
        datasets: [
          {
            // label: 'My First Dataset',
            data: DeviceCount,
            backgroundColor: [
              "rgb(28,28,28)",
              "rgb(28,28,28)",
              "rgb(149,164,252)",
            ],
            borderRadius: 5,
            barThickness: 20,
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  surgery: boolean = false;
  changeGender(type: any) {
    if (type == "hospital") {
      this.hospital = !this.hospital;
    } else if (type == "age") {
      this.age = !this.age;
    } else if (type == "bloodGroup") {
      this.bloodGroup = !this.bloodGroup;
    } else if (type == "surgery") {
      this.surgery = !this.surgery;
    }
  }
  specializationList() {
    this.apiservice
      .GetData(URLConstant.specialization, "")
      .subscribe((res: any) => {
        this.OccupationList = res?.result?.data;
        this.OccupationList.forEach((res: any) => {
          res["selected"] = false;
        });
      });
  }

  typeOfHospitalList() {
    this.apiservice
      .GetData(URLConstant.DoctorDashboardList, "")
      .subscribe((res: any) => {
        this.typeOfHospital = res?.result;
        this.typeOfHospital?.forEach((res: any) => {
          res["selected"] = false;
        });
      });
  }
  getTimeSLot: any;
  toDate: any;
  fromDate: any;
  date = new Date();
  oldDate = new Date();
  fromdata: any;
  day = new Date(this.oldDate.setDate(this.oldDate.getDate() - 1));
  selectedDates(event: any, value: any, getValue: any) {
    this.fromdata = event;
    this.byDefaultFilter = true;
    this.oldDate = new Date();
    this.dropdown = false;
    // this.selected = this.globalFilter.find(x => x.value === event)!.value;
    switch (true) {
      case event?.value == "Yesterday" || event == "Yesterday": {
        this.day.setHours(0);
        this.day.setMinutes(0);
        this.day.setSeconds(0);
        this.day.setMilliseconds(0);
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = this.day.toISOString();
        this.selected = "Yesterday";

        break;
      }
      case event?.value == "Today" || event == "Today": {
        var todatDate = new Date();
        var currentTime = new Date();
        todatDate.setHours(0);
        todatDate.setMinutes(0);
        todatDate.setSeconds(0);
        todatDate.setMilliseconds(0);
        this.toDate = currentTime.toISOString();
        this.fromDate = todatDate.toISOString();
        this.selected = "Today";

        break;
      }
      case event?.value == "Last 7 Days" || event == "Last 7 Days": {
        var weekday = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 7)
        );

        // weekday.setHours(0);
        // weekday.setMinutes(0);
        // weekday.setSeconds(0);
        // weekday.setMilliseconds(0);
        // this.date.setHours(0);
        // this.date.setMinutes(0);
        // this.date.setSeconds(0);
        // this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = weekday.toISOString();
        this.selected = "Last 7 days";

        break;
      }
      case event?.value == "Last 28 Days" || event == "Last 28 Days": {
        var monthlyday = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 28)
        );

        // monthlyday.setHours(0);
        // monthlyday.setMinutes(0);
        // monthlyday.setSeconds(0);
        // monthlyday.setMilliseconds(0);
        // this.date.setHours(0);
        // this.date.setMinutes(0);
        // this.date.setSeconds(0);
        // this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = monthlyday.toISOString();
        this.selected = "Last 28 days";
        break;
      }
      case event?.value == "Last 60 Days" || event == "Last 60 Days": {
        var twomonthlyday = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 60)
        );

        // twomonthlyday.setHours(0);
        // twomonthlyday.setMinutes(0);
        // twomonthlyday.setSeconds(0);
        // twomonthlyday.setMilliseconds(0);
        // this.date.setHours(0);
        // this.date.setMinutes(0);
        // this.date.setSeconds(0);
        // this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = twomonthlyday.toISOString();
        this.selected = "Last 60 days";

        break;
      }
      case event?.value == "Last 90 Days" || event == "Last 90 Days": {
        var threeMonths = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 90)
        );

        // threeMonths.setHours(0);
        // threeMonths.setMinutes(0);
        // threeMonths.setSeconds(0);
        // threeMonths.setMilliseconds(0);
        // this.date.setHours(0);
        // this.date.setMinutes(0);
        // this.date.setSeconds(0);
        // this.date.setMilliseconds(0);
        this.toDate = this.date?.toISOString();
        this.fromDate = threeMonths?.toISOString();
        this.selected = "Last 90 days";

        break;
      }

      case this.selectedEndDate == true: {
        this.fromDate = this.startdate?.toISOString();
        this.toDate = this.enddate?.toISOString();
        this.selected = "Date Range";

        //  console.log('goa',this.fromDate)
        break;
      }
    }
    this.cardsDetail();
    this.registrationChart();
    this.appointmentChart();
    this.appointmentToolTip();
    this.downloadPatient();
    // this.downloadSurgery();
  }
  startdate: any;
  enddate: any;
  startValues: any;
  endValues: any;
  finalDateValue: any;

  startDate(event: any) {
    this.startdate = event?.value;
    // console.log(this.startdate)

    this.startValues = this.datepipe.transform(this.startdate, "dd-MM-yyyy");
  }
  selectedEndDate: boolean = false;
  endDate(event: any) {
    this.byDefaultFilter = true;
    this.enddate = event?.value;
    this.endValues = this.datepipe.transform(this.enddate, "dd-MM-yyyy");
    this.selectedEndDate = true;
    // this.finalDateValue=this.startValues +"-"+this.endValues
    // console.log(this.finalDateValue)
    this.selected = "Date Range";
    console.log(this.globalFilter, "end global filters");
  }
  data8(event: any) {
    console.log(event);
  }
  appointmentHeader: boolean = true;
  surgeryLeadHeader: boolean = false;

  appointmetSurgeryLead(type: any) {
    if (type == "appointment") {
      this.appointmentHeader = true;
      this.surgeryLeadHeader = false;
      this.surgeryParam = [];
    } else if (type == "surgeryLead") {
      this.appointmentHeader = false;
      this.surgeryLeadHeader = true;
      this.specializationParam = [];
      this.doctorParam = [];
      this.hospitalParam = [];
    }
  }

  specializationParam: any = [];
  doctorParam: any = [];
  hospitalParam: any = [];
  surgeryParam: any = [];
  specilaizationCitiesFilter(event: any, value: any) {
    if (value == "specialization" && event?.checked == true) {
      let index = this.OccupationList.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.OccupationList[index].selected = true;
      this.specializationParam.push(event.source?.value);
    } else if (value == "specialization" && event?.checked == false) {
      let index = this.OccupationList.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.OccupationList[index].selected = false;
      this.specializationParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let ages = this.specializationParam.indexOf(ele);
          this.specializationParam.splice(ages, 1);
        }
      });
    }

    if (value == "Doctor" && event?.checked == true) {
      let index = this.typeOfHospital.findIndex(
        (el: any) => el?.doctorId == event?.source?.value
      );
      this.typeOfHospital[index].selected = true;
      this.doctorParam.push(event.source?.value);
    } else if (value == "Doctor" && event?.checked == false) {
      let index = this.typeOfHospital.findIndex(
        (el: any) => el?.doctorId == event?.source?.value
      );
      this.typeOfHospital[index].selected = false;
      this.doctorParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let bloods = this.doctorParam.indexOf(ele);
          this.doctorParam.splice(bloods, 1);
        }
      });
    }

    if (value == "Hospital" && event?.checked == true) {
      let index = this.dataSourceHospital.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.dataSourceHospital[index].selected = true;
      this.hospitalParam.push(event.source?.value);
    } else if (value == "Hospital" && event?.checked == false) {
      let index = this.dataSourceHospital.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.dataSourceHospital[index].selected = false;
      this.hospitalParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let bloods = this.hospitalParam.indexOf(ele);
          this.hospitalParam.splice(bloods, 1);
        }
      });
    }

    if (value == "surgery" && event?.checked == true) {
      let index = this.surgeryList.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.surgeryList[index].selected = true;
      this.surgeryParam.push(event.source?.value);
      console.log(this.surgeryParam);
    } else if (value == "surgery" && event?.checked == false) {
      let index = this.surgeryList.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.surgeryList[index].selected = false;
      this.surgeryParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let bloods = this.surgeryParam.indexOf(ele);
          this.surgeryParam.splice(bloods, 1);
        }
      });
      console.log(this.surgeryParam);
    }
  }

  //download data

  result: any;
  data: any = [];
  downloadPatient() {
    this.data = [];
    let param: any = {
      isExport: true,
      fromDate:
        this.byDefaultFilter == false
          ? this.appointmentStartDate
          : this.byDefaultFilter == true
          ? this.fromDate
          : "",
      toDate:
        this.byDefaultFilter == false
          ? this.appointmentEndDate
          : this.byDefaultFilter == true
          ? this.toDate
          : "",
    };
    let data: any = {
      specialization: this.specializationParam,
      doctors: this.doctorParam,
      hospitals: this.hospitalParam,
      forDashboard:
        this.specializationParam.length > 0 ||
        this.doctorParam.length > 0 ||
        this.hospitalParam.length > 0
          ? true
          : "",
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });
    this.apiservice
      .Postdata(URLConstant.appointmentList, data, param)
      .subscribe((res: any) => {
        this.result = res?.result?.data;
        console.log("result", this.result);
        for (let i = 0; i < this.result.length; i++) {
          this.data.push([
            this.result[i]?.slot,
            this.result[i]?.patientName,
            this.result[i]?.patientGender == 1 ? "Male" : "Female",
            this.result[i]?.patientPhone,
            this.result[i]?.doctorName,
            this.result[i]?.doctorPhone,
            this.result[i]?.establishmentName,
            this.result[i]?.establishmentLocality,
            this.result[i]?.establishmentCity,
          ]);
        }
      });
  }

  header = [
    "Date/Time",
    "Patient Name",
    "Patient Gender",
    "Patient Phone",
    "Doctor Name",
    "Doctor Phone",
    "Hospital Name",
    "Hospital Locality",
    "Hospital City",
  ];

  exportToCSV() {
    console.log("data", this.data);
    const headers = this.header;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.data, "Appointment List", options);
  }
  cityHeader: any = ["City Name", "Count", "Percentage", "Total Count"];
  appointmentCitiesExport() {
    const headers = this.cityHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.appointmentcities, "City List", options);
  }
  OSHeader: any = ["OS Name", "Count"];
  OSExport() {
    const headers = this.OSHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.OSdetail, "OS List", options);
  }
  browserHeader: any = ["Browser Name", "Count"];
  browserExport() {
    const headers = this.browserHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.browserDetail, "Browser List", options);
  }

  genderHeader: any = ["Gender Name", "Count"];
  genderExport() {
    const headers = this.genderHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.genderDetail, "Gender List", options);
  }

  deviceHeader: any = ["Device Name", "Count"];
  deviceExport() {
    const headers = this.deviceHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.deviceDetail, "Device List", options);
  }

  surgeryHeader: any = [
    "date",
    "Source",
    "Name",
    "Mobile",
    "Surgery Type",
    "Location",
  ];

  surgeryExport() {
    console.log(this.surgeryDetail);
    const headers = this.surgeryHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.surgeryDetail, "Surgery List", options);
  }

  registrationHeader: any = ["User Name", "Count"];
  registrationExport() {
    const headers = this.deviceHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      // showLabels: true,
      // showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.registrationDetail, "Registration List", options);
  }

  appointmentToolTip() {
    this.appointmentsCount = [];
    var todatDate = new Date();
    var currentTime = new Date();
    todatDate.setHours(0);
    todatDate.setMinutes(0);
    todatDate.setSeconds(0);
    todatDate.setMilliseconds(0);
    this.appointmentEndDate = currentTime.toISOString();
    this.appointmentStartDate = todatDate.toISOString();
    let param: any = {
      startDate:
        this.byDefaultFilter == false
          ? this.appointmentStartDate
          : this.byDefaultFilter == true
          ? this.fromDate
          : "",
      endDate:
        this.byDefaultFilter == false
          ? this.appointmentEndDate
          : this.byDefaultFilter == true
          ? this.toDate
          : "",
      typeOfList: this.appointmentHeader == true ? 1 : 2,
      specialization: this.specializationParam,
      doctors: this.doctorParam,
      hospitals: this.hospitalParam,
      surgeryTypes: this.surgeryParam,
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .Postdata(URLConstant.appointmentToolTip, param, "")
      .subscribe((res: any) => {
        console.log(res);
      });
  }
  getNotificationList: any;
  getdoctorNotiicationList: any;
  getHospitalNotificationList: any;
  notification() {
    let param: any = {
      type: this.doctor == true ? 7 : this.hospitaldata == true ? 8 : "",
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.notification, param)
      .subscribe((res: any) => {
        if (this.all == true) {
          this.getNotificationList = res?.result?.data;
        } else if (this.doctor == true) {
          this.getdoctorNotiicationList = res?.result?.data;
        } else if (this.hospitaldata == true) {
          this.getHospitalNotificationList = res?.result?.data;
        }
        for (let i = 0; i < this.getNotificationList?.length; i++) {
          this.getNotificationList[i]["name"] = this.getNotificationList[
            i
          ]?.doctor?.name?.split(" ")
            ? this.getNotificationList[i]?.doctor?.name?.split(" ")
            : this.getNotificationList[i]?.hospital?.name?.split(" ");
        }
        for (let i = 0; i < this.getdoctorNotiicationList?.length; i++) {
          this.getdoctorNotiicationList[i]["name"] =
            this.getdoctorNotiicationList[i]?.doctor?.name?.split(" ");
        }
        for (let i = 0; i < this.getHospitalNotificationList?.length; i++) {
          this.getHospitalNotificationList[i]["name"] =
            this.getHospitalNotificationList[i]?.hospital?.name?.split(" ");
        }
      });
  }
  changeNotification(type: any) {
    if (type == "all") {
      this.all = true;
      this.doctor = false;
      this.hospitaldata = false;
    }
    if (type == "doctor") {
      this.all = false;
      this.doctor = true;
      this.hospitaldata = false;
    } else if (type == "hospital") {
      this.all = false;
      this.doctor = false;
      this.hospitaldata = true;
    }
  }
  acceptRejectNotification(
    components: any,
    value: any,
    id: any,
    status: any,
    type: any
  ) {
    if (status == "doctorAccept") {
      let param: any = {
        userId: id,
      };
      let status = {
        isVerified: 2,
      };
      this.apiservice
        .patchData(URLConstant.changeDoctorStatus, status, param)
        .subscribe((res: any) => {
          if (res?.success == true) {
            this.notification();
          }
        });
    }

    const dialogRef = this.dialog.open(AcceptRejectComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        reject: value,
        userId: status == "doctorReject" ? id : "",
        hospitalId: status == "hospitalReject" ? id : "",
        viewId: id,
        value: value,
        userName: type,
      },
    });
    if (status == "doctorReject") {
      console.log("reecyed");
      dialogRef.afterClosed().subscribe((res: any) => {
        console.log("after not god");

        let status = {
          isVerified: res?.isVerified,
          rejectReason: res?.rejectReason,
        };
        let param = {
          userId: res?.userId,
        };
        this.apiservice
          .patchData(URLConstant.changeDoctorStatus, status, param)
          .subscribe((res: any) => {
            if (res?.success == true) {
              console.log("not god");
              this.notification();
            }
          });
      });
    }
  }
  hospitalAccept(components: any, value: any, id: any, status: any, type: any) {
    let param = {
      hospitalId: id,
    };
    let status1 = {
      isVerified: 2,
    };
    this.apiservice
      .patchData(URLConstant.changeStatusHospital, status1, param)
      .subscribe((res: any) => {
        if (res?.success == true) {
          this.notification();
        }
      });
    const dialogRef = this.dialog.open(AcceptRejectComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        reject: value,
        userId: status == "doctorReject" ? id : "",
        hospitalId: status == "hospitalReject" ? id : "",
        viewId: id,
        value: value,
        userName: type,
      },
    });
    if (status == "hospitalReject") {
      dialogRef.afterClosed().subscribe((res: any) => {
        let status = {
          isVerified: res?.isVerified,
          rejectReason: res?.rejectReason,
        };
        let param = {
          hospitalId: res?.hospitalId,
        };
        if (param.hospitalId != undefined || param.hospitalId != null) {
          this.apiservice
            .patchData(URLConstant.changeStatusHospital, status, param)
            .subscribe((res: any) => {
              if (res?.success == true) {
                this.notification();
              }
            });
        }
      });
    }
  }
  @ViewChild(MatSelect)
  select!: MatSelect;

  onDateSelected(event: any) {
    console.log(event?.value);
    if (event.value) {
      this.selected = "Date Range";
    }
  }
  dropdown: boolean = false;
  openDropdown() {
    this.dropdown = !this.dropdown;
  }
  closeDropdown() {
    this.dropdown = false;
    console.log("hdhhd");
  }
}
