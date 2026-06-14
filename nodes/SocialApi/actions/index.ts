import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

/** Each resource module exports an execute fn returning rows for input item `i`. */
export type ResourceExecute = (
	this: IExecuteFunctions,
	operation: string,
	i: number,
) => Promise<INodeExecutionData[]>;
