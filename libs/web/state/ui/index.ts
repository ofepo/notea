import { Settings } from 'libs/shared/settings'
import { createContainer } from 'unstated-next'
import useSidebar from './sidebar'
import useSplit from './split'
import useTitle from './title'
import useUA, { UserAgentType } from './ua'

interface Props {
  ua?: UserAgentType
  settings?: Settings
}
function useUI({ ua, settings }: Props = {}) {
  return {
    ua: useUA(ua),
    sidebar: useSidebar(ua?.isMobileOnly || settings?.sidebar_is_fold),
    split: useSplit(settings?.split_sizes),
    title: useTitle(),
  }
}

const UIState = createContainer(useUI)

export default UIState
