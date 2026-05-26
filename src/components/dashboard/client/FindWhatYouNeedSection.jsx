import React, { useState } from 'react';

const categories = [
    'Frontend developer', 'Data analyst', 'UI/UX designer',
    'Backend developer', 'Business consultant', 'Graphics designer',
    'Full-stack developer', 'SEO specialist', 'Video editor',
    'Mobile App developer', 'Social media manager', 'Illustrator',
    'WordPress developer', 'Content writer',
];

const FindWhatYouNeedSection = () => {
    const [activeTab, setActiveTab] = useState('Talents'); // Matches design default

    return (
        <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Find What You Need</h2>
                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    {['Talents', 'Projects'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition duration-150 ${
                                activeTab === tab
                                    ? 'bg-white shadow text-teal-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4">
                {categories.map((category, index) => (
                    <a key={index} href="#" className="text-gray-600 hover:text-teal-600 transition duration-150">
                        {category}
                    </a>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <a href="#" className="text-teal-600 hover:underline">Browse all →</a>
            </div>
        </section>
    );
};

export default FindWhatYouNeedSection;
