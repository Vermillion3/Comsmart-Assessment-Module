import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// If you see "Unable to resolve 'expo' from 'index.js'", it means the 'expo' package is not installed.
// To fix this, run the following command in your project directory:
//    npm install expo
// or if you use yarn:
//    yarn add expo
