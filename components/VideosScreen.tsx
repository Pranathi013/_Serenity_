import React from 'react';

interface Video {
  videoId: string;
  title: string;
  creator: string;
  duration: string;
  link: string;
  description: string;
  thumbnailUrl: string;
  category: 'Mindfulness & Mental Clarity' | 'Sleep & Deep Rest';
}

const videos: Video[] = [
  // Mindfulness & Mental Clarity
  {
    videoId: '7-1Y6IbAxdM',
    title: "What is Mindfulness?",
    creator: "Mindfulness Educator",
    duration: "~6 min",
    link: "https://www.youtube.com/watch?v=7-1Y6IbAxdM",
    description: "Explains core mindfulness practices like breath awareness, acceptance, and meditation techniques.",
    thumbnailUrl: "https://i.ytimg.com/vi/7-1Y6IbAxdM/hqdefault.jpg",
    category: "Mindfulness & Mental Clarity",
  },
  {
    videoId: 'r7HolEOnHoQ',
    title: "The Benefits of Mindfulness",
    creator: "Wellness Channel",
    duration: "~5 min",
    link: "https://www.youtube.com/watch?v=r7HolEOnHoQ",
    description: "Highlights how mindfulness reduces stress, improves focus, and enhances emotional resilience.",
    thumbnailUrl: "https://i.ytimg.com/vi/r7HolEOnHoQ/hqdefault.jpg",
    category: "Mindfulness & Mental Clarity",
  },
  // Sleep & Deep Rest
  {
    videoId: 'AKGrmY8OSHM',
    title: "Non-Sleep Deep Rest (NSDR) with Dr. Andrew Huberman",
    creator: "Huberman Lab",
    duration: "~30 min",
    link: "https://www.youtube.com/watch?v=AKGrmY8OSHM",
    description: "A guided NSDR protocol to restore energy and calm the nervous system—ideal for post-yoga wind-down.",
    thumbnailUrl: "https://i.ytimg.com/vi/AKGrmY8OSHM/hqdefault.jpg",
    category: "Sleep & Deep Rest",
  },
  {
    videoId: '3mHNCnaPndE',
    title: "The TRUTH About Non-Sleep Deep Rest (NSDR)",
    creator: "Wellness Educator",
    duration: "~10 min",
    link: "https://www.youtube.com/watch?v=3mHNCnaPndE",
    description: "Explains what NSDR is, when to use it, and how it benefits mental clarity and sleep quality.",
    thumbnailUrl: "https://i.ytimg.com/vi/3mHNCnaPndE/hqdefault.jpg",
    category: "Sleep & Deep Rest",
  },
   {
    videoId: 'FxDSeZcedlA',
    title: "Stages of Sleep Explained: The Secret to Restful Nights",
    creator: "Sleep Science Channel",
    duration: "~8 min",
    link: "https://www.youtube.com/watch?v=FxDSeZcedlA",
    description: "Breaks down deep sleep, REM, and light sleep stages to help users understand sleep architecture.",
    thumbnailUrl: "https://i.ytimg.com/vi/FxDSeZcedlA/hqdefault.jpg",
    category: "Sleep & Deep Rest",
  },
   {
    videoId: 'NxituhoYucY',
    title: "Restorative Yoga: What's the difference between deep rest and sleep?",
    creator: "Yoga Educator",
    duration: "~12 min",
    link: "https://www.youtube.com/watch?v=NxituhoYucY",
    description: "Explores how restorative yoga supports deep rest and mental recovery.",
    thumbnailUrl: "https://i.ytimg.com/vi/NxituhoYucY/hqdefault.jpg",
    category: "Sleep & Deep Rest",
  },
  {
    videoId: 'eWvxIe1mmS8',
    title: "30 Minute Non-Sleep Deep Rest (NSDR) to Restore Mental Energy",
    creator: "Huberman Lab",
    duration: "30:00",
    link: "https://www.youtube.com/watch?v=eWvxIe1mmS8",
    description: "A full NSDR session designed to replenish mental and physical energy.",
    thumbnailUrl: "https://i.ytimg.com/vi/eWvxIe1mmS8/hqdefault.jpg",
    category: "Sleep & Deep Rest",
  },
  {
    videoId: 'hEypv90GzDE',
    title: "20 Minute Non-Sleep Deep Rest (NSDR) to Restore Mental Energy",
    creator: "Huberman Lab",
    duration: "20:00",
    link: "https://www.youtube.com/watch?v=hEypv90GzDE",
    description: "A shorter NSDR protocol for quick recovery and stress relief.",
    thumbnailUrl: "https://i.ytimg.com/vi/hEypv90GzDE/hqdefault.jpg",
    category: "Sleep & Deep Rest",
  },
];

const VideoCard: React.FC<{ video: Video }> = ({ video }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-lg">
    <div className="relative">
      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover" />
       <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
        {video.duration}
      </span>
    </div>
    <div className="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-md text-brand-gray-darkest leading-tight">{video.title}</h3>
        <p className="text-sm text-brand-gray font-medium mb-2">by {video.creator}</p>
        <p className="text-sm text-brand-gray-dark">{video.description}</p>
      </div>
      <div className="mt-4">
        <a
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-block text-center py-2 px-3 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  </div>
);

const VideosScreen: React.FC = () => {
  const categories: Video['category'][] = [
    'Mindfulness & Mental Clarity',
    'Sleep & Deep Rest',
  ];

  const categoryEmojis = {
    'Mindfulness & Mental Clarity': '🌿',
    'Sleep & Deep Rest': '😴',
  };

  return (
    <div className="p-5 space-y-6 bg-brand-sky-blue min-h-full">
      <header className="px-2">
        <h1 className="text-2xl font-bold text-brand-gray-darkest">Guided Videos</h1>
        <p className="text-brand-gray">Visual guides for calm and mindfulness.</p>
      </header>
      
      {categories.map(category => (
        <section key={category}>
            <h2 className="text-xl font-bold text-brand-gray-darkest mb-3 px-2">
                {categoryEmojis[category]} {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.filter(v => v.category === category).map(video => (
                    <VideoCard key={video.videoId} video={video} />
                ))}
            </div>
        </section>
      ))}
    </div>
  );
};

export default VideosScreen;