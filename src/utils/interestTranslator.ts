
/**
 * Utility function to translate interest values to Portuguese
 */
export const translateInterest = (interest: string): string => {
  switch (interest) {
    case 'men':
      return 'Homens';
    case 'women':
      return 'Mulheres';
    case 'all':
    default:
      return 'Todos';
  }
};
