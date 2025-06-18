import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Clerk } from '@clerk/clerk-js';

//Clave frontend API clerk
const CLERCK_PUBLISHABLE_KEY =
  'pk_test_YWNjdXJhdGUtcXVldHphbC00OS5jbGVyay5hY2NvdW50cy5kZXYk';
const clerk = new Clerk(CLERCK_PUBLISHABLE_KEY);

clerk.load().then(() => {
  (window as any).Clerk = clerk;
  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
  );
});
