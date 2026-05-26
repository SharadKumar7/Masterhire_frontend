import React from 'react';
import { Link } from 'react-router-dom';

// 1. Data is now inside the component
const resources = [
    { title: 'Budget & pricing', description: 'Understand rates, fees, and how to set your budget', color: 'bg-teal-100', icon: '💸' },
    { title: 'Payment & billing', description: 'Learn about payment methods, invoicing, and refunds', color: 'bg-blue-100', icon: '💳' },
    { title: 'Privacy & security', description: 'Your data security and privacy on MasterHire', color: 'bg-purple-100', icon: '🔒' },
    { title: 'Hiring & Contracts', description: 'Best practices for drafting agreements and onboarding', color: 'bg-orange-100', icon: '📝' },
    { title: 'Dispute Resolution', description: 'How to handle work disagreements and use mediation', color: 'bg-red-100', icon: '⚖️' },
    { title: 'Account Growth', description: 'Tips to optimize your profile and attract top talent', color: 'bg-green-100', icon: '🚀' },
];


const ResourceHelp = () => {
    return (
        <section className='min-h-screen w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className="flex max-w-6xl justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Help and resources</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                    // 2. Individual Card UI
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center text-2xl`}>
                            {resource.icon}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">{resource.title}</h4>
                            <p className="text-sm text-gray-500">{resource.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ResourceHelp;
