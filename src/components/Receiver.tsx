import type { Alphabet } from '../types';

type Props = {
	maxContext: number;
	alphabet: Alphabet;
	popFromQueue: () => string | undefined;
};

const Receiver = ({ maxContext, alphabet, popFromQueue }: Props) => {
	return (
		<div className='p-8'>
			<header className='mb-8'>
				<h3 className='mb-2 text-xl font-semibold'>Receiver</h3>
				<p>
					Received chunk: <strong>{'<ESC>'}</strong>
				</p>
			</header>

			<section className='mb-8'>
				<h3 className='mb-2 text-xl font-semibold'>
					State of contexts before receiving chunk
				</h3>

				<div className='mb-4'>
					<p>Context 2</p>
					<table className='w-full table-fixed border border-neutral-300 bg-white text-center'>
						<thead className='border-b border-neutral-300'>
							<tr>
								<th colSpan={1}>{'<ESC>'}</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td colSpan={1}>1</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div className='mb-4'>
					<p>Context 1</p>
					<table className='w-full table-fixed border border-neutral-300 bg-white text-center'>
						<thead className='border-b border-neutral-300'>
							<tr>
								<th colSpan={1}>{'<ESC>'}</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td colSpan={1}>1</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div className='mb-4'>
					<p>Context 0</p>
					<table className='w-full table-fixed border border-neutral-300 bg-white text-center'>
						<thead className='border-b border-neutral-300'>
							<tr>
								<th colSpan={1}>{'<ESC>'}</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td colSpan={1}>1</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div className='mb-4'>
					<p>Context -1</p>
					<table className='w-full table-fixed border border-neutral-300 bg-white text-center'>
						<thead className='border-b border-neutral-300'>
							<tr>
								<th colSpan={1}>-</th>
								<th colSpan={1}>m</th>
								<th colSpan={1}>o</th>
								<th colSpan={1}>t</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td colSpan={1}>1</td>
								<td colSpan={1}>1</td>
								<td colSpan={1}>1</td>
								<td colSpan={1}>1</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section className='mb-8'>
				<h3 className='mb-2 text-xl font-semibold'>What letter we decode</h3>
				<p className='text-neutral-400'>Don't know yet</p>
			</section>

			<section>
				<h3 className='mb-2 text-xl font-semibold'>Encoded message (up to now)</h3>
				<p className='text-neutral-400'>Don't know yet</p>
			</section>
		</div>
	);
};

export default Receiver;
