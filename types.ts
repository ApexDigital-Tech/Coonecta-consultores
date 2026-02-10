import React from 'react';

export interface Service {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  target: string[];
  process: string[];
  deliverables: string[];
  price?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  location: string;
  year: string;
  challenge: string;
  solution: string[];
  results: string[];
  testimonial?: {
    quote: string;
    author: string;
  };
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface AppointmentData {
  id?: string;
  clientName: string;
  phone: string;
  email: string;
  organization: string;
  needType: string;
  topic: string;
  preferredDateTime: string;
  consultant: string;
  notes: string;
  status?: 'new' | 'contacted' | 'scheduled' | 'closed';
  createdAt?: string;
}