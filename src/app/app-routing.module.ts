import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pages/bluetooth',
    pathMatch: 'full'
  },
  {
    path: 'pages/graph',
    loadChildren: () => import('./pages/graph/graph.module').then( m => m.GraphPageModule)
  },
  {
    path: 'pages/bluetooth',
    loadChildren: () => import('./pages/bluetooth/bluetooth.module').then( m => m.BluetoothPageModule)
  },
  {
    path: 'pages/info',
    loadChildren: () => import('./pages/info/info.module').then( m => m.InfoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
