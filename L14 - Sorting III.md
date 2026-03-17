This note introduces radix sort and a few higher-level properties used to compare sorting algorithms beyond asymptotic runtime alone.

# Can We Do Better Than $O(N \log N)$?

For **comparison-based sorting**, the answer is no.

- $O(N \log N)$ is the provable asymptotic lower bound for comparison-based sorting in the worst case.
- The key observation is that sorting by comparisons requires at least $N \log N$ comparisons in the worst case.

So the next question is:

- What if we do not compare elements directly at all?

That is possible for certain data types, which leads to radix sort.

# Radix Sort

Radix sort is a **non-comparison-based** sorting algorithm that processes digits instead of directly comparing full keys.

## Core Idea

| Variant | Idea |
| ------- | ---- |
| LSD radix sort | Start from the least significant digit |
| MSD radix sort | Start from the most significant digit |

## Algorithm

1. **Distribute:** place elements into buckets based on the current active digit.
2. **Gather:** empty the buckets back into the main array in bucket order.
3. **Repeat:** move to the next digit to the left and do it again.

## Radix Sort in Action

This example uses LSD radix sort.

### Pass 1: Ones Digit

Start with the least significant digit.

![[radix_few_steps.png|569]]

After a few insertions, each element is being placed into the bucket matching its ones digit.

![[radix_done_1.png|555]]

Once the first pass is complete:

- Some buckets contain multiple values.
- A linked list is one way to allow multiple elements per bucket while preserving order.

![[radix_after_iter_1.png|557x215]]

After gathering the buckets back into the array, the result is:

`[780, 351, 672, 3, 24, 126, 76, 917, 17, 8, 259]`

### Pass 2: Tens Digit

Now repeat the same process using the tens digit.

![[radix_pass_2.png|568]]

![[radix_after_iter_2.png|573]]

After gathering again, the array becomes:

`[3, 8, 917, 17, 24, 126, 351, 259, 672, 76, 780]`

### Pass 3: Hundreds Digit

Finally, process the hundreds digit.

![[radix_pass_3.png|580]]

The figure highlights an important detail:

- Elements that do not have a hundreds digit automatically go to bucket `0`.

![[radix_done.png|584]]

After the final gather, the array is completely sorted:

`[3, 8, 17, 24, 76, 126, 259, 351, 672, 780, 917]`

## Handling Negative Numbers

Naive radix sort ignores the negative sign, so it does not correctly order negative values.

Two common fixes:

1. Use two sets of buckets: one for negative values and one for positive values. When gathering, reverse the negative side.
2. Use one set of buckets, but in the final pass gather negatives first and positives second.

## Time and Space Complexity

| Quantity | Meaning |
| -------- | ------- |
| $M$ | Maximum number of digits |
| $N$ | Number of elements |
| $K$ | Number of buckets (the radix / base) |

- Time complexity: $O(M(N + K))$
- Space complexity: $O(N + K)$

Why the extra space?

- We need memory for the buckets.
- We also need space to hold the elements inside those buckets.

> [!tip]
> If $M$ and $K$ are small constants, then radix sort behaves like $O(N)$.

# Not All $O(N \log N)$ Sorts Are Created Equal

If heap sort, merge sort, and quicksort all have $O(N \log N)$ behavior in common cases, which one is "best"?

The answer depends on more than asymptotic notation.

| Characteristic | Heap Sort | Merge Sort | Quick Sort |
| -------------- | --------- | ---------- | ---------- |
| Guaranteed $O(N \log N)$ | Yes | Yes | **No** |
| Extra space needed | $O(1)$ | **$O(N)$** | $O(\log N)$ |
| Good locality | **No** | Yes | Yes |

![[Scalability.png|577]]

What the graph is showing:

- Heap sort scales the worst in practice here.
- Merge sort performs better than heap sort.
- Quicksort performs best on this chart.

The main reason highlighted in lecture:

- Heap sort has poor locality, which leads to poor cache and memory behavior.

> [!info]
> This is why hardware knowledge matters: two algorithms with similar asymptotic labels can behave very differently in practice.

# Stability

Some sorts are stable and some are not.

## Definition

A **stable sort** preserves the relative order of duplicate keys throughout the algorithm.

## What Causes Instability?

- Instability is often caused by non-adjacent swaps across the array.

## Why Stability Matters

- Stability allows multiple sorts to be composed while preserving meaningful order among duplicates.
- Example: sort people by first name, then by last name.

> [!note]
> Stability is especially useful when records have multiple fields and you care about secondary ordering.

# Adaptive Sorting Algorithms

Some sorting algorithms are adaptive and some are not.

## Definition

An **adaptive** sorting algorithm can take advantage of preexisting order in the input.

This can happen:

- By design
- Or by adding optimizations that detect nearly sorted data

## Why Adaptivity Matters

- Adaptive algorithms may terminate early or do much less work on nearly sorted input.
- Example: bubble sort can stop early when no swap occurs in a full pass.

> [!question]
> Among the sorting algorithms covered so far, which ones are adaptive?
