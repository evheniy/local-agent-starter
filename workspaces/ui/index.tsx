import { element } from '@vyriy/render/element';

import { AgentShell } from '@p/components/agent-shell';
import '@p/components/styles.scss';
import { useAgentShellTab, useChatPanelState, useFileUploadState } from './hooks/index.js';

const LocalAgentApp = () => {
  const agentShellTab = useAgentShellTab();
  const chatPanel = useChatPanelState();
  const fileUpload = useFileUploadState();

  return (
    <AgentShell
      tab={agentShellTab.tab}
      chatPanel={{
        answer: chatPanel.answer,
        canSubmit: chatPanel.canSubmit,
        error: chatPanel.error,
        isLoading: chatPanel.isLoading,
        question: chatPanel.question,
        onQuestionChange: chatPanel.setQuestion,
        onSubmit: chatPanel.submitQuestion,
      }}
      files={fileUpload.files}
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
