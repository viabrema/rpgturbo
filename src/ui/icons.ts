import type { IconType } from 'react-icons'
import { FcGoogle } from 'react-icons/fc'
import { MdEmail } from 'react-icons/md'
import { RiLogoutBoxRLine } from 'react-icons/ri'

export const icons: Record<'google' | 'email' | 'logout', IconType> = {
  google: FcGoogle,
  email: MdEmail,
  logout: RiLogoutBoxRLine,
}
