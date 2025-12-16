import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-laser',
  imports: [Navbar],
  templateUrl: './laser.html',
  styleUrl: './laser.scss'
})
export class Laser {
  
}
