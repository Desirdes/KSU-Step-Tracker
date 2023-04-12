import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { AddStepsComponent } from './add-steps/add-steps.component';
import { ProgressComponent } from './progress/progress.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'questionnaire', component: QuestionnaireComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'sidenav', component: SidenavComponent },
  { path: 'add-steps', component: AddStepsComponent },
  { path: 'progress', component: ProgressComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }