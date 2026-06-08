import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Editor, Toolbar } from "ngx-editor";
import { ApiService } from "../../shared/api.service";
import { URLConstant } from "../../apisURL/url";

@Component({
  selector: "app-compose-announcement",
  templateUrl: "./compose-announcement.component.html",
  styleUrls: ["./compose-announcement.component.scss"],
})
export class ComposeAnnouncementComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  editor!: Editor;
  sending = false;
  testing = false;
  titleFocused = false;
  editorFocused = false;
  showSchedule = false;
  showTestPanel = false;

  // Emoji picker
  showEmojiPicker = false;
  emojiCategories = [
    {
      name: "Smileys",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😜", "🤔", "🤗", "🤭", "😏", "😌", "😴", "🤯", "😎", "🥳"],
    },
    {
      name: "Gestures",
      emojis: ["👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "💪", "🙏", "👋", "✍️", "🫡", "🫶"],
    },
    {
      name: "Hearts",
      emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💯", "💥", "✨", "🔥", "⭐"],
    },
    {
      name: "Objects",
      emojis: ["📢", "📣", "🔔", "💊", "🩺", "🏥", "💉", "🩹", "📋", "📆", "🎉", "🎊", "🎯", "💡", "📌"],
    },
  ];

  toolbar: Toolbar = [
    ["bold", "italic", "underline", "strike"],
    ["ordered_list", "bullet_list"],
    ["link", "image"],
    ["text_color", "background_color"],
    [{ heading: ["h1", "h2", "h3"] }],
    ["align_left", "align_center", "align_right"],
  ];

  audienceOptions = [
    { value: "doctors", label: "Doctors", icon: "🩺" },
    { value: "patients", label: "Patients", icon: "🧑‍⚕️" },
    { value: "all", label: "All Users", icon: "👥" },
  ];

  statusOptions = [
    { value: 2, label: "Approved" },
    { value: 1, label: "Pending" },
  ];

  specializations: any[] = [];
  cities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComposeAnnouncementComponent>,
    private apiService: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.form = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(3)]],
      message: ["", Validators.required],
      targetAudience: ["doctors", Validators.required],
      whatsapp: [true],
      email: [true],
      // Doctor filter fields
      filterCity: [""],
      filterSpecialization: [""],
      filterStatus: [""],
      // Scheduling
      scheduledAt: [null],
      // Test Preview
      testEmail: [""],
      testPhone: [""],
      testCountryCode: ["+91"],
    });

    this.fetchSpecializations();
    this.fetchDoctorCities();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  fetchSpecializations(): void {
    this.apiService.GetData(URLConstant.announcementsSpecializations, {}).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.result)) {
          this.specializations = res.result;
        }
      },
      error: () => {
        // Silently fail — specialization filter will just be empty
      },
    });
  }

  fetchDoctorCities(): void {
    this.apiService.GetData(URLConstant.announcementsDoctorCities, {}).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.result)) {
          this.cities = res.result;
        }
      },
      error: () => {
        // Silently fail — city filter will just be empty
      },
    });
  }

  get isDoctorAudience(): boolean {
    return this.form.get("targetAudience")?.value === "doctors";
  }

  // ─── Emoji helpers ────────────────────────────────────────
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  insertEmoji(emoji: string): void {
    const view = this.editor.view;
    if (view) {
      const { state } = view;
      const { tr } = state;
      const textNode = state.schema.text(emoji);
      const transaction = tr.replaceSelectionWith(textNode);
      view.dispatch(transaction);
      view.focus();
    }
    this.showEmojiPicker = false;
  }

  onSend(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const channels: string[] = [];
    if (this.form.value.whatsapp) channels.push("whatsapp");
    if (this.form.value.email) channels.push("email");

    if (channels.length === 0) {
      this.snack.open("Select at least one channel", "OK", { duration: 3000 });
      return;
    }

    this.sending = true;

    // Build filters only when audience is doctors
    let filters: any = undefined;
    if (this.isDoctorAudience) {
      const f: any = {};
      if (this.form.value.filterCity) {
        f.city = this.form.value.filterCity;
      }
      if (this.form.value.filterSpecialization) {
        f.specialization = this.form.value.filterSpecialization;
      }
      if (this.form.value.filterStatus) {
        f.status = this.form.value.filterStatus;
      }
      if (Object.keys(f).length > 0) {
        filters = f;
      }
    }

    const payload: any = {
      title: this.form.value.title,
      message: this.form.value.message,
      targetAudience: this.form.value.targetAudience,
      channels,
    };
    if (filters) {
      payload.filters = filters;
    }
    if (this.showSchedule && this.form.value.scheduledAt) {
      payload.scheduledAt = this.form.value.scheduledAt;
    }

    this.apiService.Postdata(URLConstant.announcementsSend, payload, {}).subscribe({
      next: (res: any) => {
        this.sending = false;
        if (res?.success) {
          const msg = this.showSchedule ? "Announcement scheduled!" : "Announcement queued!";
          this.snack.open(msg, "OK", { duration: 3000 });
          this.dialogRef.close("sent");
        } else {
          this.snack.open(res?.msgCode || "Send failed", "OK", {
            duration: 3000,
          });
        }
      },
      error: (err: any) => {
        this.sending = false;
        this.snack.open(
          err?.error?.msgCode || err?.message || "Failed to send",
          "OK",
          { duration: 3000 }
        );
      },
    });
  }

  onSendTest(): void {
    const channels: string[] = [];
    if (this.form.value.whatsapp) channels.push("whatsapp");
    if (this.form.value.email) channels.push("email");

    if (channels.length === 0) {
      this.snack.open("Select at least one channel for test", "OK", { duration: 3000 });
      return;
    }

    const testEmail = this.form.value.testEmail;
    const testPhone = this.form.value.testPhone;

    if (!testEmail && channels.includes("email")) {
      this.snack.open("Enter test email", "OK", { duration: 3000 });
      return;
    }
    if (!testPhone && channels.includes("whatsapp")) {
      this.snack.open("Enter test phone", "OK", { duration: 3000 });
      return;
    }

    this.testing = true;
    const payload = {
      title: this.form.value.title,
      message: this.form.value.message,
      channels,
      testEmail,
      testPhone,
      testCountryCode: this.form.value.testCountryCode
    };

    this.apiService.Postdata(URLConstant.announcementsSendTest, payload, {}).subscribe({
      next: (res: any) => {
        this.testing = false;
        if (res?.success) {
          this.snack.open("Test message sent!", "OK", { duration: 3000 });
          this.showTestPanel = false;
        } else {
          this.snack.open(res?.msgCode || "Test failed", "OK", { duration: 3000 });
        }
      },
      error: (err: any) => {
        this.testing = false;
        this.snack.open(err?.error?.msgCode || "Test failed", "OK", { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
