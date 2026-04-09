import type { IconType } from 'react-icons'
import { FcGoogle } from 'react-icons/fc'
import { MdEmail } from 'react-icons/md'
import { RiNotification3Line } from 'react-icons/ri'
import { RiLogoutBoxRLine } from 'react-icons/ri'

export const icons: Record<'google' | 'email' | 'logout' | 'notifications', IconType> = {
  google: FcGoogle,
  email: MdEmail,
  logout: RiLogoutBoxRLine,
  notifications: RiNotification3Line,
}
