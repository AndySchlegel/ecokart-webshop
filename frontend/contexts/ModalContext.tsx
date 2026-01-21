'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (id: string) => {
    setActiveModal(id);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const isModalOpen = (id: string) => {
    return activeModal === id;
  };

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal, isModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
