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
	const { add, remove, queue, size: queueSize, first } = useQueue<string>([]);

	return (
		<div className='space-y-8 p-4'>
			<header>
				<h2 className='text-xl font-semibold'>Constatnts known to both sides</h2>
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

			<main className='grid grid-cols-2 gap-x-4'>
				<Sender maxContext={maxContext} alphabet={alphabet} pushToQueue={add} />
				<Receiver
					isSomethingYet={queueSize > 0}
					maxContext={maxContext}
					alphabet={alphabet}
					popFromQueue={() => {
						const result = first;
						remove();
						return result;
					}}
				/>
			</main>

			<section>
				<h2 className='text-xl font-semibold'>Documentation</h2>
				<ul className='list-inside list-disc'>
					<li>
						Alphabet means all letters that can be possibly encoded. They are also
						present in the Context -1.
					</li>
					<li>
						Highest context means the highest order of context (letters back) that the
						algorithm is looking for.
					</li>
					<li>
						Message queue is a queue with all symbols/arithmetic ranges sender sends to
						the receiver that should be later decoded.
					</li>
					<li>
						Next to "Message to encode" we can distinguish the current letter that is
						encoded. Only that letter is not grayed out.
					</li>
					<li>
						Context table colored with blue background means the context we are looking
						for right now. It starts from the highest and goes to the lowest one.
					</li>
					<li>
						Like in PPM, if current symbol IS NOT present in the context we are looking
						at, we send {'"<ESC>"'} and go context down.
					</li>
					<li>
						If current symbol IS present in the context, we send that letter with it's
						arithmetical range and go to the next symbol.
					</li>
				</ul>
			</section>
		</div>
	);
}

export default App;
