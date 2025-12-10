export type Alphabet = string[];

export type Context = {
	order: number;
	appearsAfter: string;
	symbols: { symbol: string; count: number }[];
};
