import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSpinnerComponent } from '../../components/app-spinner/app-spinner.component'
import { FormsModule, ReactiveFormsModule, FormBuilder,FormControl, FormGroup, Validators} from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'
import { of, catchError } from 'rxjs';
import { InternetStatusComponent } from 'src/app/components/internet-status/internet-status.component';
import {HeaderComponent} from '../../components/header/header.component';
import { IonToggle, IonItem, IonContent, IonList, IonLabel, IonFooter, IonSpinner, IonLoading } from '@ionic/angular/standalone';
import { CupsCodesService } from 'src/app/services/cups-codes.service';
import { SpecialtyService } from 'src/app/services/specialty.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ HttpClientModule, IonContent, IonSpinner,IonList,IonItem,IonToggle,IonLabel,IonFooter,IonLoading,IonicModule, CommonModule, FormsModule, ReactiveFormsModule, AppSpinnerComponent, InternetStatusComponent, HeaderComponent]
})

export class LoginPage implements OnInit {



  formLogin: FormGroup;
  passwordVisible: boolean = false;
  errorMensaje: string | null = null;
  isLoading = false;
  loading:HTMLIonLoadingElement;


  constructor(
    public fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private cupsCodesService: CupsCodesService,
    private specialtyService: SpecialtyService
  ) {}

  ngOnInit() {
    this.formLogin = this.fb.group({
      user: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]{3,}')]),
      stayInChk: new FormControl(false)
    });
  }

  ionViewDidEnter() {
    this.auth.checkAuthentication().subscribe((authenticated) => {
      if (authenticated) {
        this.router.navigateByUrl('/home');
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async doLogin() {

    this.formLogin.markAllAsTouched();

    if (this.formLogin.valid) {
      this.isLoading = true;
      const rememberMe = this.formLogin.get('stayInChk')?.value;

      this.auth.login(this.formLogin.value.user, this.formLogin.value.password,rememberMe)
      .pipe(
        catchError((error) => {
          console.log('entro a catchError', error)
          this.isLoading = false;
          this.loadingCtrl.dismiss();
          this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.isLoading = false;
          this.loadMasterData();
          this.loadingCtrl.dismiss();
          this.router.navigateByUrl('/home');
        } else {
          this.isLoading = false;
          this.loadingCtrl.dismiss();
          this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
        }
      });
    } 
  }

  async loadMasterData() {
    this.cupsCodesService.getRemoteCups().subscribe();
    this.specialtyService.getRemoteSpecialties().subscribe();
  }
}
