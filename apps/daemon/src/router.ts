import { Router, createCors } from 'itty-router';

export const { preflight, corsify } = createCors({
	methods: ['GET'],
	origins: ['https://dn-status.surge.sh'],
});
export const router = Router().all('*', preflight);
