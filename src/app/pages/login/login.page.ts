import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InternetStatusComponent]
})
export class LoginPage implements OnInit {

  constructor(private router: Router){}

  ngOnInit(){}

  goToPatientIntake(){
    this.router.navigateByUrl('/patient-intake');
  }

}
