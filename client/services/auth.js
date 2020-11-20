import axios from 'axios';

const authService = (headers = null) => {
  // On minikube: kubectl expose deployment ingress-nginx-controller --target-port=80 --type=NodePort -n kube-system
  const baseURL = typeof window === 'undefined'
    ? 'http://ingress-nginx-controller.kube-system.svc.cluster.local/api/users'
    : '/api/users';

  const api = axios.create({
    baseURL,
    headers
  });

  return {
    async currentUser() {
      const response = await api.get('/currentuser');

      const { currentUser } = response.data;

      return currentUser;
    },

    async signup({ email, password }) {
      const response = await api.post('/signup', { email, password });

      const user = response.data;

      return user;
    },

    async signin({ email, password }) {
      const response = await api.post('/signin', { email, password });

      const user = response.data;

      return user;
    },

    async signout() {
      await api.post('/signout', {});
    },
  }
}

export default authService;
