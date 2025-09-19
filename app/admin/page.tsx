"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [templateCount, setTemplateCount] = useState<number>(0);
    const [userCount, setUserCount] = useState<number>(0); // 👈 new state

    // Fetch templates count
    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await fetch("/api/templates");
                const data = await res.json();
                setTemplateCount(data.length); // count templates
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            }
        }

        async function fetchUsers() {
            try {
                const res = await fetch("/api/users"); // 👈 your users API
                const data = await res.json();
                setUserCount(data.length); // count users
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        }

        fetchTemplates();
        fetchUsers();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Templates Card */}
                <div
                    onClick={() => router.push("/admin/templates")}
                    className="cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
                >
                    <div className="text-sm">
                        <h2>Manage Templates</h2>
                    </div>
                    <div className="text-3xl font-bold mt-2">
                        {templateCount} Templates
                    </div>
                    <div className="text-xs mt-2">Total available</div>
                </div>

                {/* Users Card */}
                <div
                    onClick={() => router.push("/admin/users")}
                    className="cursor-pointer bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
                >
                    <div className="text-sm">
                        <h2>Manage Users</h2>
                    </div>
                    <div className="text-3xl font-bold mt-2">
                        {userCount} Users
                    </div>
                    <div className="text-xs mt-2">View all registered users</div>
                </div>
            </div>
        </div>
    );
}
