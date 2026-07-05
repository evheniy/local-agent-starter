import { server } from '@vyriy/server';
import { api } from '@vyriy/handler';
import { createRouter } from '@vyriy/router';

import { html } from '@p/api';

server(api(async (event) => createRouter().get('/', html).route(event)));
