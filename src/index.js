import Vue from 'vue';
import Vuetify from 'vuetify';
Vue.use(Vuetify);
import VueResource from 'vue-resource';
Vue.use(VueResource);
// GITHUBAPI
import GitHubAPI from 'vue-github-api';
Vue.use(GitHubAPI, {token: 'user Personal Access Token'});
import 'bootstrap/dist/css/bootstrap.css';
import GitIssuesAndMiles from './app/IssuesAndMilestones.vue';
import './index.scss';
import 'vuetify/dist/vuetify.min.css';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      components: {
        data: {
        },
        default: GitIssuesAndMiles
      }
    }
  ]
});
export default new Vue({
  el: '#root',
  data: {
  },
  router,
  render: h => h('router-view')
});
