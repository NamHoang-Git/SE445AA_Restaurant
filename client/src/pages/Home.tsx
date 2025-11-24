import React from 'react';
import { LogoMarquee } from '../components/home/logo-marquee';
import { AppverseFooter } from '../components/home/appverse-footer';

const Home: React.FC = () => {
    return (
        <div className="relative min-h-screen">
            {/* Content - position relative để nổi lên trên background */}
            <div className="relative z-10">
                <LogoMarquee />
                <AppverseFooter />
            </div>
        </div>
    );
};

export default Home;
