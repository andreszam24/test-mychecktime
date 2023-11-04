import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder,FormControl, FormGroup, Validators} from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; 
import{ AuthServiceService } from '../../services/auth.service.service'
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
})
export class LoginPage implements OnInit {

  formLogin: FormGroup;
  passwordVisible: boolean = false;
  errorMensaje: string | null = null;


  constructor(
    public fb:FormBuilder,
    private authService: AuthServiceService,
    private router: Router,
    ) { 
  }

  ngOnInit() {
    this.formLogin = this.fb.group({
      user: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]{3,}')])
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  doLogin() {
    if (this.formLogin.valid) {
      // Llamada al servicio de login
      this.authService.login(this.formLogin.value.email, this.formLogin.value.password)
        .then((user) => {
          if (user && user.id) {
            // El usuario está autenticado
            this.router.navigateByUrl('/home');
          } else {
            // El usuario no está autenticado
            this.errorMensaje = 'El usuario no existe o las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
          }
        })
        .catch((error) => {
          // Se produjo un error
          this.errorMensaje = 'Se produjo un error al iniciar sesión. Por favor, inténtalo de nuevo.';
        });
    }
  }
}