import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

// Hooks Redux typés pour l'application
// Utiliser ces hooks au lieu de useDispatch/useSelector de react-redux
// pour bénéficier du typage TypeScript automatique
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
