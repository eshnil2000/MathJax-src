/*************************************************************
 *
 *  Copyright (c) 2017 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * @fileoverview  Implements the interface and abstract class for the OutputJax
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {userOptions, defaultOptions, OptionList} from '../util/Options.js';
import {MathDocument} from './MathDocument.js';
import {MathItem, Metrics} from './MathItem.js';
import {DOMAdaptor} from '../core/DOMAdaptor.js';
import {FunctionList} from '../util/FunctionList.js';

/*****************************************************************/
/**
 *  The OutputJax interface
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface OutputJax<N, T, D> {
    /**
     * The name of this output jax class
     */
    name: string;

    /**
     * The options for the instance
     */
    options: OptionList;

    /**
     * Lists of post-filters to call after typesetting the math
     */
    postFilters: FunctionList;

    /**
     * The DOM adaptor for managing HTML elements
     */
    adaptor: DOMAdaptor<N, T, D>;

    /**
     * @param{DOMAdaptor}  The adaptor to use in this jax
     */
    setAdaptor(adaptor: DOMAdaptor<N, T, D>): void;

    /**
     * Typset a given MathItem
     *
     * @param{MathItem} math          The MathItem to be typeset
     * @param{MathDocument} document  The MathDocument in which the typesetting should occur
     * @return{N}                     The DOM tree for the typeset math
     */
    typeset(math: MathItem<N, T, D>, document?: MathDocument<N, T, D>): N;

    /**
     * Handle an escaped character (e.g., \$ from the TeX input jax preventing it from being a delimiter)
     *
     * @param{MathItem} math          The MathItem to be escaped
     * @param{MathDocument} document  The MathDocument in which the math occurs
     * @return{N}                     The DOM tree for the escaped item
     */
    escaped(math: MathItem<N, T, D>, document?: MathDocument<N, T, D>): N;

    /**
     * Get the metric information for all math in the given document
     *
     * @param{MathDocument} document  The MathDocument being processed
     */
    getMetrics(document: MathDocument<N, T, D>): void;

    /**
     * Produce the stylesheet needed for this output jax
     *
     * @param{MathDocument} document  The MathDocument being processed
     */
    styleSheet(document: MathDocument<N, T, D>): N;
}


/*****************************************************************/
/**
 *  The OutputJax abstract class
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export abstract class AbstractOutputJax<N, T, D> implements OutputJax<N, T, D> {

    public static NAME: string = 'generic';
    public static OPTIONS: OptionList = {};

    public options: OptionList;
    public postFilters: FunctionList;
    public adaptor: DOMAdaptor<N, T, D> = null;  // set by the handler

    /**
     * @param{OptionList} options  The options for this instance
     */
    constructor(options: OptionList = {}) {
        let CLASS = this.constructor as typeof AbstractOutputJax;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.postFilters = new FunctionList();
    }

    /**
     * @return{string}  The name for this output jax class
     */
    public get name() {
        return (this.constructor as typeof AbstractOutputJax).NAME;
    }

    /**
     * @override
     */
    public setAdaptor(adaptor: DOMAdaptor<N, T, D>) {
        this.adaptor = adaptor;
    }

    /**
     * @override
     */
    public abstract typeset(math: MathItem<N, T, D>, document?: MathDocument<N, T, D>): N;

    /**
     * @override
     */
    public abstract escaped(math: MathItem<N, T, D>, document?: MathDocument<N, T, D>): N;

    /**
     * @override
     */
    public getMetrics(document: MathDocument<N, T, D>) {
    }

    /**
     * @override
     */
    public styleSheet(document: MathDocument<N, T, D>) {
        return null as N;
    }

    /**
     * Execute a set of filters, passing them the MathItem and any needed data,
     *  and return the (possibly modified) data
     *
     * @param{FunctionList} filters  The list of functions to be performed
     * @param{MathItem} math         The math item that is being processed
     * @param{any} data              Whatever other data is needed
     * @return{any}                  The (possibly modified) data
     */
    protected executeFilters(filters: FunctionList, math: MathItem<N, T, D>, data: any) {
        let args = {math: math, data: data};
        filters.execute(args);
        return args.data;
    }

}
