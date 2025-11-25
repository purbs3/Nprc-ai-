import React, { useState } from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import PricingSection from './PricingSection';
import BlogSection from './BlogSection';
import TherapistsSection from './TherapistsSection';
import BookingModal from './BookingModal';
import { Therapist } from '../types';

interface HomePageProps {
    onNavigate: (path: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

    const handleBookNow = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setIsBookingModalOpen(true);
    };

    return (
        <>
            <HeroSection onNavigate={onNavigate} />
            <FeaturesSection />
            <TherapistsSection onBookNow={handleBookNow} />
            <TestimonialsSection />
            <PricingSection onNavigate={onNavigate} />
            <BlogSection onNavigate={onNavigate} />
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                therapist={selectedTherapist}
            />
        </>
    );
};

export default HomePage;