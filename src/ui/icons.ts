import type { IconType } from 'react-icons'
import { FcGoogle } from 'react-icons/fc'
import { MdAdd } from 'react-icons/md'
import { MdClose } from 'react-icons/md'
import { MdEmail } from 'react-icons/md'
import { RiNotification3Line } from 'react-icons/ri'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import { RiUserUnfollowLine } from 'react-icons/ri'

export const icons: Record<
  'google' | 'email' | 'logout' | 'notifications' | 'add' | 'close' | 'removeUser',
  IconType
> = {
  google: FcGoogle,
  email: MdEmail,
  logout: RiLogoutBoxRLine,
  notifications: RiNotification3Line,
  add: MdAdd,
  close: MdClose,
  removeUser: RiUserUnfollowLine,
}
