import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Task, Medicine } from '../types';

const NotificationInstructionsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-brand-gray-darkest">How to Enable Notifications</h2>
        <p className="text-brand-gray-dark">
          To get reminders, you'll need to manually change the notification permission in your browser's settings. Here are the general steps:
        </p>
        <div className="bg-brand-gray-lightest p-4 rounded-lg space-y-2 text-brand-gray-darkest">
          <ol className="list-decimal list-inside space-y-1">
            <li>Open your browser's main menu (usually <strong>three dots or lines</strong> in the top-right corner).</li>
            <li>Go to <strong>Settings</strong>.</li>
            <li>Find the "<strong>Privacy and Security</strong>" or "<strong>Site Settings</strong>" section.</li>
            <li>Look for "<strong>Notifications</strong>".</li>
            <li>Find this website in the "Not allowed to send notifications" list and change its permission to "<strong className="text-green-600">Allow</strong>".</li>
          </ol>
        </div>
        <p className="text-sm text-brand-gray">
          After allowing notifications, please reload the page for the changes to take effect.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};


const Scheduler: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [permission, setPermission] = useState(Notification.permission);
    const [showNotificationInstructions, setShowNotificationInstructions] = useState(false);
    
    const [taskName, setTaskName] = useState('');
    const [taskTime, setTaskTime] = useState('09:00');
    const [taskDuration, setTaskDuration] = useState(30);
    
    const [medName, setMedName] = useState('');
    const [medTime, setMedTime] = useState('08:00');

    // FIX: In browser environments, setTimeout returns a number, not a NodeJS.Timeout object.
    const timeoutIdsRef = useRef<number[]>([]);

    useEffect(() => {
        try {
            const savedTasks = localStorage.getItem('userTasks');
            if (savedTasks) {
                const parsed = JSON.parse(savedTasks);
                if (Array.isArray(parsed)) {
                    setTasks(parsed);
                }
            }

            const savedMeds = localStorage.getItem('userMedicines');
            if (savedMeds) {
                const parsed = JSON.parse(savedMeds);
                if (Array.isArray(parsed)) {
                    setMedicines(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to load schedule data:", error);
        }
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        const p = await Notification.requestPermission();
        setPermission(p);
    }, []);
    
    const handlePermissionClick = () => {
        if (permission === 'denied') {
            setShowNotificationInstructions(true);
        } else {
            requestNotificationPermission();
        }
    };

    useEffect(() => {
        timeoutIdsRef.current.forEach(clearTimeout);
        timeoutIdsRef.current = [];

        if (permission === 'granted') {
            const now = new Date();
            
            const scheduleNotification = (title: string, body: string, time: string) => {
                const [hour, minute] = time.split(':').map(Number);
                const scheduleTime = new Date();
                scheduleTime.setHours(hour, minute, 0, 0);

                const delay = scheduleTime.getTime() - now.getTime();
                if (delay > 0) {
                    const timeoutId = setTimeout(() => {
                        new Notification(title, { body, icon: '/vite.svg' });
                    }, delay);
                    // FIX: The return type of setTimeout in the browser is number. The cast to NodeJS.Timeout is incorrect.
                    timeoutIdsRef.current.push(timeoutId);
                }
            };

            tasks.forEach(task => scheduleNotification('Task Reminder', `Time to start: ${task.name} (${task.duration} mins)`, task.startTime));
            medicines.forEach(med => scheduleNotification('Medicine Reminder', `Time to take: ${med.name}`, med.time));
            scheduleNotification('Sleep Reminder', 'It\'s 10:30 PM. Time to wind down for a good night\'s sleep.', '22:30');
        }

        return () => {
            timeoutIdsRef.current.forEach(clearTimeout);
        };
    }, [tasks, medicines, permission]);
    
    const handleAddTask = () => {
        if (!taskName.trim()) return;
        const newTask: Task = { id: Date.now().toString(), name: taskName.trim(), startTime: taskTime, duration: taskDuration };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        localStorage.setItem('userTasks', JSON.stringify(updatedTasks));
        setTaskName('');
    };
    
    const handleAddMedicine = () => {
        if (!medName.trim()) return;
        const newMed: Medicine = { id: Date.now().toString(), name: medName.trim(), time: medTime };
        const updatedMeds = [...medicines, newMed];
        setMedicines(updatedMeds);
        localStorage.setItem('userMedicines', JSON.stringify(updatedMeds));
        setMedName('');
    };
    
    const handleDelete = (id: string, type: 'task' | 'medicine') => {
        if (type === 'task') {
            const updated = tasks.filter(t => t.id !== id);
            setTasks(updated);
            localStorage.setItem('userTasks', JSON.stringify(updated));
        } else {
            const updated = medicines.filter(m => m.id !== id);
            setMedicines(updated);
            localStorage.setItem('userMedicines', JSON.stringify(updated));
        }
    };
    
    const formatTime12hr = (time: string) => {
        const [h, m] = time.split(':');
        return new Date(0,0,0, Number(h), Number(m)).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    };
    
    const timetable = useMemo(() => {
        // FIX: Use `as const` to allow TypeScript to use discriminated unions for type narrowing.
        const items = [
            ...tasks.map(t => ({ ...t, type: 'Task' as const, time: t.startTime })),
            ...medicines.map(m => ({ ...m, type: 'Medicine' as const, time: m.time })),
            { id: 'sleep', name: 'Go to bed', type: 'Sleep' as const, time: '22:30' }
        ];
        return items.sort((a, b) => a.time.localeCompare(b.time));
    }, [tasks, medicines]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-brand-gray-darkest">🕒 Smart Scheduler</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-gray-light">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {permission !== 'granted' && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                            <p className="font-bold">Enable Notifications</p>
                            <p>To get reminders, please allow notifications from this app.</p>
                            <button onClick={handlePermissionClick} className="mt-2 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded hover:bg-yellow-600">
                                {permission === 'denied' ? 'Permission Denied - Check Browser Settings' : 'Allow Notifications'}
                            </button>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-bold text-brand-gray-darkest mb-3">Add to Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Add Task */}
                            <div className="bg-brand-gray-lightest p-4 rounded-lg space-y-2">
                                <p className="font-semibold text-brand-gray-dark">Add a Task</p>
                                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task name" className="w-full p-2 border rounded"/>
                                <div className="flex gap-2">
                                    <input type="time" value={taskTime} onChange={e => setTaskTime(e.target.value)} className="w-full p-2 border rounded"/>
                                    <input type="number" value={taskDuration} onChange={e => setTaskDuration(Number(e.target.value))} placeholder="Duration (min)" className="w-full p-2 border rounded"/>
                                </div>
                                <button onClick={handleAddTask} className="w-full py-2 bg-brand-blue text-white font-semibold rounded hover:bg-brand-blue-dark">Add Task</button>
                            </div>
                            {/* Add Medicine */}
                            <div className="bg-brand-gray-lightest p-4 rounded-lg space-y-2">
                                <p className="font-semibold text-brand-gray-dark">Add a Medicine</p>
                                <input type="text" value={medName} onChange={e => setMedName(e.target.value)} placeholder="Medicine name" className="w-full p-2 border rounded"/>
                                <input type="time" value={medTime} onChange={e => setMedTime(e.target.value)} className="w-full p-2 border rounded"/>
                                <button onClick={handleAddMedicine} className="w-full py-2 bg-brand-teal text-white font-semibold rounded hover:bg-brand-teal-dark">Add Medicine</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-brand-gray-darkest mb-3">Today's Timetable</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {timetable.length > 1 ? timetable.map(item => (
                                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-semibold text-brand-blue">{formatTime12hr(item.time)}</span>
                                        <div>
                                            <p className="font-semibold text-brand-gray-darkest">{item.name}</p>
                                            {/* FIX: Removed erroneous type assertion. Type narrowing now correctly infers `item.duration`. */}
                                            <p className="text-xs text-brand-gray">
                                                {item.type} {item.type === 'Task' && `(${item.duration} mins)`}
                                            </p>
                                        </div>
                                    </div>
                                    {item.type !== 'Sleep' && (
                                        <button onClick={() => handleDelete(item.id, item.type.toLowerCase() as 'task'|'medicine')} className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <p className="text-center text-brand-gray py-4">Your schedule is empty. Add a task or medicine to get started!</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
             {showNotificationInstructions && <NotificationInstructionsModal onClose={() => setShowNotificationInstructions(false)} />}
        </div>
    );
};

export default Scheduler;