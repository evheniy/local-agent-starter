import { element } from '@vyriy/render/element';

import { AgentShell } from '@p/components/agent-shell';
import '@p/components/styles.scss';
import { useAgentShellTab, useChatPanelState, useFileUploadState } from './hooks/index.js';

const LocalAgentApp = () => {
  const agentShellTab = useAgentShellTab();
  const fileUpload = useFileUploadState();
  const chatPanel = useChatPanelState({ files: fileUpload.files });

  return (
    <AgentShell
      tab={agentShellTab.tab}
      chatPanel={{ ...chatPanel }}
      files={fileUpload.files}
      filesPanel={{
        isRefreshing: fileUpload.isRefreshing,
        onRefresh: fileUpload.syncFiles,
      }}
      traceEvents={[]}
      uploadPanel={{
        error: fileUpload.error,
        file: fileUpload.file,
        status: fileUpload.status,
        onFileChange: fileUpload.setFile,
        onUpload: fileUpload.uploadFile,
      }}
      onTabChange={agentShellTab.setTab}
    />
  );
};

element({
  root: document.getElementById('root'),
  component: <LocalAgentApp />,
});
