import axios from 'axios';

const paymentsService = (headers = null) => {
  // On minikube: kubectl expose deployment ingress-nginx-controller --target-port=80 --type=NodePort -n kube-system
  // http://ingress-nginx-controller.kube-system.svc.cluster.local/api/payments
  const baseURL = typeof window === 'undefined'
    ? 'http://ticketing-payments-srv:3000/api/payments'
    : '/api/payments';

  const api = axios.create({
    baseURL,
    headers
  });

  return {
    async create({ token, orderId }) {
      const response = await api.post('/', {
        token,
        orderId,
      });

      const payment = response.data;

      return payment;
    },
  }
}

export default paymentsService;
