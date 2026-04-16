import m from 'mithril';

import {AppActions, AppState} from './models/state';
import App from './views/app';

import './styles/chart.scss';
import './styles/index.scss';

const state = AppState();
const actions = AppActions(state);

m.mount(document.body, {view: () => m(App, {state, actions})});
