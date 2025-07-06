export const getErrorMessage = (message: string, t: (key: string) => string) => {
  if (message.includes('Invalid login credentials')) {
    return t('auth.toast.errors.invalidCredentials');
  }
  if (message.includes('User already registered')) {
    return t('auth.toast.errors.userExists');
  }
  if (message.includes('Email not confirmed')) {
    return t('auth.toast.errors.emailNotConfirmed');
  }
  if (message.includes('Password should be at least')) {
    return t('auth.toast.errors.passwordTooShort');
  }
  return message;
};