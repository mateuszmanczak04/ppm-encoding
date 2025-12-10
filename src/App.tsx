import { useState } from 'react';
import type { Alphabet } from './types';
import Sender from './components/Sender';
import Receiver from './components/Receiver';
import { useQueue } from '@uidotdev/usehooks';

function App() {
	const [maxContext] = useState<number>(2);
	const [alphabet] = useState<Alphabet>(['-', 'm', 'o', 't'].sort());

	// Queue of messages passed between between sender and receiver
	// Sender should push to the queue
	// Receiver should pop from the queue
	const { add, remove, queue, size: queueSize } = useQueue<string>([]);

	return (
		<div>
			<header className='pl-4'>
				<h3 className='mb-2 text-xl font-semibold'>Constatnts known to both sides</h3>

				<p>Alphabet:</p>
				<ul className='mb-4 flex w-fit items-stretch border border-neutral-300 border-r-transparent'>
					{alphabet.map((symbol) => (
						<li key={symbol} className='border-r border-neutral-300 px-2'>
							{symbol}
						</li>
					))}
				</ul>

				<p>
					Highest context: <strong>{maxContext}</strong>
				</p>
				<p>Message queue:</p>
				<div className='flex w-fit flex-row-reverse'>
					{queue.map((el, i) => (
						<div
							className='flex flex-col items-center border border-neutral-300 px-2 text-nowrap'
							key={i}
						>
							{el}
							{i === queueSize - 1 && (
								<span className='text-xs text-neutral-500'>(recently sent)</span>
							)}
							{i === 0 && (
								<span className='text-xs text-neutral-500'>(first to decode)</span>
							)}
						</div>
					))}
				</div>
			</header>
			<div className='grid grid-cols-2 gap-x-4'>
				<Sender maxContext={maxContext} alphabet={alphabet} pushToQueue={add} />
				{/* <Receiver maxContext={maxContext} alphabet={alphabet} popFromQueue={remove} /> */}
			</div>
		</div>
	);
}

export default App;
