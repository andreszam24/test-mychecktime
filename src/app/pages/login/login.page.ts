import { Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSpinnerComponent } from '../../components/app-spinner/app-spinner.component'
import { FormsModule, ReactiveFormsModule, FormBuilder,FormControl, FormGroup, Validators} from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'
import { of, catchError } from 'rxjs';
import { InternetStatusComponent } from 'src/app/components/internet-status/internet-status.component';
import { IonToggle, IonItem, IonContent, IonList, IonLabel, IonFooter, IonSpinner, IonLoading } from '@ionic/angular/standalone';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner,IonList,IonItem,IonToggle,IonLabel,IonFooter,IonLoading,IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, AppSpinnerComponent, InternetStatusComponent],
})
export class LoginPage implements OnInit {

  //@ViewChild(AppSpinnerComponent) spinnerComponent: AppSpinnerComponent;


  formLogin: FormGroup;
  passwordVisible: boolean = false;
  errorMensaje: string | null = null;
  isLoading = false;
  loading:HTMLIonLoadingElement;


  constructor(
    public fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    const mainContent = document.getElementById('menu') as HTMLElement;
    mainContent.style.display = 'none';
    this.formLogin = this.fb.group({
      user: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]{3,}')])
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async doLogin() {
    if (this.formLogin.valid) {
      this.isLoading = true;


      // Muestra el spinner
      //await this.spinnerComponent.presentLoading();
  

      //await loading.present();
      this.auth.login(this.formLogin.value.user, this.formLogin.value.password)
      .pipe(
        catchError((error) => {
          this.isLoading = false;
          //loading.dismiss();
          this.loadingCtrl.dismiss();
          this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
          return of(null);
        })
      )
      .subscribe((res) => {
        console.log('entro res')
        if (res) {
          this.isLoading = false;
          //loading.dismiss();
          this.loadingCtrl.dismiss();
          this.router.navigateByUrl('/home');
        } else {
          this.isLoading = false;
          //loading.dismiss();
          this.loadingCtrl.dismiss();
          this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
        }
      });
    }
  }
}
