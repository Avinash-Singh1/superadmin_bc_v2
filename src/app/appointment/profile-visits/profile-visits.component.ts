import { Component, OnInit } from "@angular/core";
import { forkJoin } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({ selector: "app-profile-visits", templateUrl: "./profile-visits.component.html", styleUrls: ["./profile-visits.component.scss"] })
export class ProfileVisitsComponent implements OnInit {
  visits: any[] = []; loading = false; search = ""; total = 0;
  selectedRange: "today" | "week" | "month" = "today";
  stats = { today: 0, week: 0, month: 0 };
  constructor(private api: ApiService) {}
  ngOnInit(): void { this.loadStats(); this.loadVisits(); }
  rangeDates(range: "today" | "week" | "month") { const now = new Date(); const start = new Date(now); start.setHours(0,0,0,0); if (range === "week") start.setDate(start.getDate()-6); if (range === "month") start.setDate(start.getDate()-29); return { fromDate: start.toISOString(), toDate: now.toISOString() }; }
  params(range: "today" | "week" | "month", paging = true): any { const p: any = { status: 3, ...this.rangeDates(range) }; if (paging) { Object.assign(p,{page:1,size:100,sort:"createdAt",sortOrder:"DESC"}); if (this.search.trim()) p.search = this.search.trim(); } return p; }
  loadStats(): void { forkJoin({today:this.api.Postdata(URLConstant.appointmentList,"",this.params("today",false)),week:this.api.Postdata(URLConstant.appointmentList,"",this.params("week",false)),month:this.api.Postdata(URLConstant.appointmentList,"",this.params("month",false))}).subscribe({next:(r:any)=>this.stats={today:r.today?.result?.count||0,week:r.week?.result?.count||0,month:r.month?.result?.count||0},error:()=>this.stats={today:0,week:0,month:0}}); }
  loadVisits(): void { this.loading=true; this.api.Postdata(URLConstant.appointmentList,"",this.params(this.selectedRange)).subscribe({next:(r:any)=>{this.visits=r?.result?.data||[];this.total=r?.result?.count||0;this.loading=false},error:()=>{this.visits=[];this.total=0;this.loading=false}}); }
  statusLabel(status:number):string{return status===3?"Visited only":"Unknown";}
}
