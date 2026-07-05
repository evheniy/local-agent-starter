import { element } from '@vyriy/render/element';

import { AgentShell } from '@p/components/agent-shell';
import '@p/components/styles.scss';

element({
  root: document.getElementById('root'),
  component: <AgentShell />,
});
