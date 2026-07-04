import React from 'react';

export default function Navbar() {
	return (
		<nav className="bg-white shadow-sm">
			<div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
				<div className="text-lg font-bold text-gray-900">MERN Job Board</div>
				<div className="space-x-4 text-sm text-gray-600">
					<a href="#" className="hover:text-gray-900">Jobs</a>
					<a href="#" className="hover:text-gray-900">Companies</a>
					<a href="#" className="hover:text-gray-900">Post a Job</a>
				</div>
			</div>
		</nav>
	);
}
