import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSpinnerComponent } from '../../components/app-spinner/app-spinner.component'
import { FormsModule, ReactiveFormsModule, FormBuilder,FormControl, FormGroup, Validators} from '@angular/forms';
import { IonicModule, AlertController, NavController, LoadingController} from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; 
import{ AuthService } from '../../services/auth.service'
import { Router } from '@angular/router';
import { of, catchError } from 'rxjs';




@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, AppSpinnerComponent],
})
export class LoginPage implements OnInit {

  formLogin: FormGroup;
  passwordVisible: boolean = false;
  errorMensaje: string | null = null;
  isLoading = false;


  constructor(
    public fb:FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private navCtrl: NavController, private loadingCtrl: LoadingController
    ) { 
  }

  ngOnInit() {
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
      const loading = await this.loadingCtrl.create({
        message: 'Cargando...',
      });
  
      await loading.present();
      this.auth.login(this.formLogin.value.user, this.formLogin.value.password)
      .pipe(
        catchError((error) => {
          this.isLoading = false;
          loading.dismiss();
          this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.isLoading = false;
          loading.dismiss();
          this.router.navigateByUrl('/home');
        } else {
          this.isLoading = false;
          loading.dismiss();
          this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
        }
      });
    }
  }
}