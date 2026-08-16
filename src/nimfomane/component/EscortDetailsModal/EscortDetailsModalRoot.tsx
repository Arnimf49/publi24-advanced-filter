import React, {useCallback, useEffect, useState} from 'react';
import {escortInfoActions} from '../../core/escortInfoActions';
import {NimfomaneStorage, EscortItem} from '../../core/storage';
import {NimfomaneMemoryStorage} from '../../core/memoryStorage';
import {escortDetailsModal} from './EscortDetailsModal';

type EscortDetailsModalRootProps = {
  user: string;
  onClose: () => void;
};

const EscortDetailsModalRoot: React.FC<EscortDetailsModalRootProps> = ({user, onClose}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [escort, setEscort] = useState<EscortItem>(() => NimfomaneStorage.getEscort(user));
  const [_, setRenderCycle] = useState(0);
  const escortMemoryState = NimfomaneMemoryStorage.getEscortState(user);

  useEffect(() => {
    const onEscortChanged = (nextEscort: EscortItem) => setEscort(nextEscort);
    const onEscortMemoryChanged = () => setRenderCycle(value => value + 1);
    NimfomaneStorage.onEscortChanged(user, onEscortChanged);
    NimfomaneMemoryStorage.onEscortMemoryChanged(user, onEscortMemoryChanged);

    return () => {
      NimfomaneStorage.removeOnEscortChanged(user, onEscortChanged);
      NimfomaneMemoryStorage.removeOnEscortMemoryChanged(user, onEscortMemoryChanged);
    };
  }, [user]);

  const collectDetails = useCallback((refresh: boolean) => {
    setIsLoading(true);
    setError(null);

    const collection = refresh
      ? escortInfoActions.refreshDetails(user)
      : escortInfoActions.ensureDetails(user);
    collection.catch(collectionError => {
      console.error(`Failed to collect escort details for ${user}:`, collectionError);
      setError('Datele nu au putut fi analizate.');
    }).finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    collectDetails(false);
  }, [collectDetails]);

  const handleRefresh = useCallback(() => {
    collectDetails(true);
  }, [collectDetails]);

  const {EscortDetailsModal} = escortDetailsModal;
  return (
    <EscortDetailsModal
      user={user}
      escort={escort}
      isLoading={isLoading}
      error={error}
      imageLoadError={escortMemoryState.escortAnalysisError}
      onRefresh={handleRefresh}
      onClose={onClose}
    />
  );
};

export const escortDetailsModalRoot = {
  EscortDetailsModalRoot,
};
